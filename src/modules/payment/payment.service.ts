import Stripe from "stripe";

import { prisma } from "../../lib/prisma";

import config from "../../config";
import {
  PaymentStatus,
  PropertyStatus,
  RentalRequestStatus,
} from "../../../generated/prisma/enums";
import stripe from "../../lib/stripe";

const USD_TO_BDT_RATE = Number(config.exchange_rate_usd_to_bdt) || 110;

// Helpers
const calculateTotalAmountBDT = (
  rentPerMonth: number,
  durationMonths: number,
) => {
  return rentPerMonth * durationMonths;
};

const bdtToUsdCents = (amountBDT: number) => {
  const amountUSD = amountBDT / USD_TO_BDT_RATE;
  return Math.round(amountUSD * 100);
};

// Create Checkout Session

const createCheckoutSession = async (
  rentalRequestId: string,
  tenantId: string,
) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true, payment: true },
  });

  if (!rentalRequest) {
    throw new Error("Rental request not found");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new Error("This is not your rental request");
  }

  if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
    throw new Error("Rental request must be APPROVED before payment");
  }

  // Reject only if a payment already SUCCEEDED — PENDING/FAILED can be reused
  if (rentalRequest.payment?.status === PaymentStatus.SUCCESS) {
    throw new Error("This rental has already been paid for");
  }

  const totalAmountBDT = Number(rentalRequest.totalAmount);
  const amountCents = bdtToUsdCents(totalAmountBDT);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Rent - ${rentalRequest.property.title} (${rentalRequest.rentalDuration} months)`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.app_url}/payment/cancel`,
    metadata: {
      rentalRequestId: rentalRequest.id, // fallback lookup key in webhook
      tenantId,
    },
  });

  if (rentalRequest.payment) {
    // PENDING or FAILED payment exists — reuse the row instead of creating a duplicate
    await prisma.payment.update({
      where: { id: rentalRequest.payment.id },
      data: {
        stripeSessionId: session.id,
        amount: totalAmountBDT,
        status: PaymentStatus.PENDING,
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        rentalRequestId: rentalRequest.id,
        stripeSessionId: session.id,
        amount: totalAmountBDT,
        currency: "BDT",
        paymentMethod: "card",
        status: PaymentStatus.PENDING,
      },
    });
  }

  return { checkoutUrl: session.url };
};

// Webhook Handling

const processSuccessfulPayment = async (session: Stripe.Checkout.Session) => {
  // Primary lookup: stripeSessionId. Fallback: metadata.rentalRequestId
  // (protects against edge cases where the session ID somehow doesn't match).
  let payment = await prisma.payment.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (!payment && session.metadata?.rentalRequestId) {
    payment = await prisma.payment.findUnique({
      where: { rentalRequestId: session.metadata.rentalRequestId },
    });
  }

  if (!payment) return;

  // Idempotency guard — Stripe may send the same webhook event more than once
  if (payment.status === PaymentStatus.SUCCESS) return;

  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: { id: payment.rentalRequestId },
  });

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
        paymentIntentId: session.payment_intent as string,
        transactionId: session.payment_intent as string,
      },
    });

    await tx.rentalRequest.update({
      where: { id: rentalRequest.id },
      data: { status: RentalRequestStatus.ACTIVE },
    });

    await tx.property.update({
      where: { id: rentalRequest.propertyId },
      data: { status: PropertyStatus.RENTED },
    });
  });
};

const processExpiredSession = async (session: Stripe.Checkout.Session) => {
  await prisma.payment.updateMany({
    where: {
      stripeSessionId: session.id,
      status: { not: PaymentStatus.SUCCESS }, // never downgrade a completed payment
    },
    data: { status: PaymentStatus.FAILED },
  });
};

const handleWebhookEvent = async (rawBody: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe_webhook_secret_key as string,
    );
  } catch (err) {
    throw new Error("Invalid Stripe webhook signature");
  }

  switch (event.type) {
    case "checkout.session.completed":
      await processSuccessfulPayment(
        event.data.object as Stripe.Checkout.Session,
      );
      break;

    case "checkout.session.expired":
      await processExpiredSession(event.data.object as Stripe.Checkout.Session);
      break;

    default:
      break;
  }

  return { received: true };
};

const getMyPaymentsFromDb = async (
  tenantId: string,
  status?: PaymentStatus,
) => {
  const where: any = {
    rentalRequest: {
      tenantId,
    },
  };

  if (status) {
    where.status = status;
  }
  if (status && !Object.values(PaymentStatus).includes(status)) {
    throw new Error("Invalid payment status.");
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      rentalRequest: {
        include: {
          property: {
            include: {
              category: true,
              landlord: {
                omit: {
                  password: true,
                },
              },
              images: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};

const getSinglePaymentFromDb = async (paymentId: string, tenantId: string) => {
  const payment = await prisma.payment.findFirstOrThrow({
    where: {
      id: paymentId,
      rentalRequest: {
        tenantId,
      },
    },
    include: {
      rentalRequest: {
        include: {
          property: {
            include: {
              category: true,
              images: true,
              landlord: {
                omit: {
                  password: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return payment;
};

export const PaymentService = {
  createCheckoutSession,
  handleWebhookEvent,
  getMyPaymentsFromDb,
  getSinglePaymentFromDb,
};

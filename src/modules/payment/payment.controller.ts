import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { PaymentService } from "./payment.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentStatus } from "../../../generated/prisma/enums";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response) => {
    const { rentalRequestId } = req.body;
    const tenantId = req.user!.id;

    const result = await PaymentService.createCheckoutSession(
      rentalRequestId,
      tenantId,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Checkout session created successfully.",
      data: result,
    });
  },
);

 
const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Missing Stripe signature.",
      });
    }

    await PaymentService.handleWebhookEvent(
      req.body as Buffer,
      signature as string,
    );

    return res.status(httpStatus.OK).json({
      received: true,
    });
  } catch (error: any) {
    console.error("Stripe Webhook Error:", error.message);

    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: error.message || "Webhook processing failed.",
    });
  }
};

const getMyPayments = catchAsync(async (req: Request, res: Response , next:NextFunction) => {
  const tenantId = req.user!.id;

  const { status } = req.query;

  const result = await PaymentService.getMyPaymentsFromDb(
    tenantId,
    status as PaymentStatus,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payments retrieved successfully.",
    data: result,
  });
});

const getSinglePayment = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const tenantId = req.user!.id;

    const result = await PaymentService.getSinglePaymentFromDb(
      id as string ,
      tenantId,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment retrieved successfully.",
      data: result,
    });
  },
);

export const PaymentController = {
  createCheckoutSession,
  handleWebhook,
  getMyPayments,
  getSinglePayment
};
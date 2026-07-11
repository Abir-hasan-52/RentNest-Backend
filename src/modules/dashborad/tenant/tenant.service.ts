// import { PaymentStatus, RentalRequestStatus } from "../../generated/prisma/enums";
// import { prisma } from "../../lib/prisma";

import {
  PaymentStatus,
  RentalRequestStatus,
} from "../../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";

const getLast6MonthRanges = () => {
  const ranges = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = start.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
    ranges.push({ label, start, end });
  }

  return ranges;
};

// month is a whole-number offset — good enough for this assignment's scope
// (doesn't need to handle exact day-of-month edge cases like Feb 30th)
const addMonths = (date: Date, months: number) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const getDashboardFromDb = async (tenantId: string) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthRanges = getLast6MonthRanges();

  const [
    totalRentals,
    pendingRentals,
    approvedRentals,
    activeRentals,
    completedRentals,

    totalPayments,
    successPayments,
    pendingPayments,
    failedPayments,
    totalSpentAgg,
    monthlySpentAgg,

    reviewAgg,

    recentRentals,
    recentPayments,
    recentReviews,

    upcomingMoveInRequest,
    currentResidenceRequest,

    spendingTrendRaw,
  ] = await Promise.all([
    prisma.rentalRequest.count({ where: { tenantId } }),
    prisma.rentalRequest.count({
      where: { tenantId, status: RentalRequestStatus.PENDING },
    }),
    prisma.rentalRequest.count({
      where: { tenantId, status: RentalRequestStatus.APPROVED },
    }),
    prisma.rentalRequest.count({
      where: { tenantId, status: RentalRequestStatus.ACTIVE },
    }),
    prisma.rentalRequest.count({
      where: { tenantId, status: RentalRequestStatus.COMPLETED },
    }),

    prisma.payment.count({ where: { rentalRequest: { tenantId } } }),
    prisma.payment.count({
      where: { rentalRequest: { tenantId }, status: PaymentStatus.SUCCESS },
    }),
    prisma.payment.count({
      where: { rentalRequest: { tenantId }, status: PaymentStatus.PENDING },
    }),
    prisma.payment.count({
      where: { rentalRequest: { tenantId }, status: PaymentStatus.FAILED },
    }),
    prisma.payment.aggregate({
      where: { rentalRequest: { tenantId }, status: PaymentStatus.SUCCESS },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        rentalRequest: { tenantId },
        status: PaymentStatus.SUCCESS,
        paidAt: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
    }),

    prisma.review.aggregate({
      where: { tenantId },
      _count: { rating: true },
      _avg: { rating: true },
    }),

    prisma.rentalRequest.findMany({
      where: { tenantId },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        moveInDate: true,
        property: { select: { id: true, title: true, city: true } },
      },
    }),

    prisma.payment.findMany({
      where: { rentalRequest: { tenantId } },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        status: true,
        rentalRequest: {
          select: { property: { select: { id: true, title: true } } },
        },
      },
    }),

    prisma.review.findMany({
      where: { tenantId },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        property: { select: { id: true, title: true } },
      },
    }),

    // Nearest upcoming move-in: approved but not yet moved in
    prisma.rentalRequest.findFirst({
      where: {
        tenantId,
        status: RentalRequestStatus.APPROVED,
        moveInDate: { gte: now },
      },
      orderBy: { moveInDate: "asc" },
      select: {
        moveInDate: true,
        rentalDuration: true,
        property: { select: { id: true, title: true, city: true } },
      },
    }),

    // Current active residence (assumes one active rental at a time per tenant)
    prisma.rentalRequest.findFirst({
      where: { tenantId, status: RentalRequestStatus.ACTIVE },
      orderBy: { moveInDate: "desc" },
      select: {
        moveInDate: true,
        rentalDuration: true,
        property: { select: { id: true, title: true, city: true } },
      },
    }),

    Promise.all(
      monthRanges.map((range) =>
        prisma.payment.aggregate({
          where: {
            rentalRequest: { tenantId },
            status: PaymentStatus.SUCCESS,
            paidAt: { gte: range.start, lt: range.end },
          },
          _sum: { amount: true },
        }),
      ),
    ),
  ]);

  const spendingTrend = monthRanges.map((range, i) => ({
    month: range.label,
    amount: Number(spendingTrendRaw[i]?._sum.amount ?? 0),
  }));
  const upcomingMoveIn = upcomingMoveInRequest
    ? {
        property: upcomingMoveInRequest.property.title,
        propertyId: upcomingMoveInRequest.property.id,
        moveInDate: upcomingMoveInRequest.moveInDate,
      }
    : null;

  const currentResidence = currentResidenceRequest
    ? {
        property: currentResidenceRequest.property.title,
        propertyId: currentResidenceRequest.property.id,
        moveInDate: currentResidenceRequest.moveInDate,
        rentalDuration: currentResidenceRequest.rentalDuration,
        leaseEndDate: currentResidenceRequest.moveInDate
          ? addMonths(
              currentResidenceRequest.moveInDate,
              currentResidenceRequest.rentalDuration,
            )
          : null,
      }
    : null;

  return {
    rentals: {
      total: totalRentals,
      pending: pendingRentals,
      approved: approvedRentals,
      active: activeRentals,
      completed: completedRentals,
    },

    payments: {
      totalPayments,
      successPayments,
      pendingPayments,
      failedPayments,
      totalSpent: Number(totalSpentAgg._sum.amount ?? 0),
      monthlySpent: Number(monthlySpentAgg._sum.amount ?? 0),
      trend: spendingTrend,
    },

    reviews: {
      totalReviews: reviewAgg._count.rating,
      averageRatingGiven: Number((reviewAgg._avg.rating ?? 0).toFixed(1)),
    },

    recentRentals,
    recentPayments,
    recentReviews,

    upcomingMoveIn,
    currentResidence,
  };
};

export const tenantDashboardService = {
  getDashboardFromDb,
};

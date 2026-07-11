// import {

//   PaymentStatus,
//   PropertyStatus,
//   RentalRequestStatus,
// } from "../../generated/prisma/enums";
// import { prisma } from "../../lib/prisma";
import {
  PaymentStatus,
  PropertyStatus,
  RentalRequestStatus,
} from "../../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { ILandlordDashboard } from "./landlord.interface";

// Local helper — kept inside this file so the landlord module stays self-contained
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

const getDashboardFromDb = async (
  landlordId: string,
): Promise<ILandlordDashboard> => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthRanges = getLast6MonthRanges();

  const [
    totalProperties,
    availableProperties,
    rentedProperties,

    totalRentals,
    pendingRentals,
    approvedRentals,
    activeRentals,
    completedRentals,

    revenueAgg,
    monthlyRevenueAgg,

    reviewAgg,

    recentRentalRequests,
    recentPayments,
    recentReviews,

    landlordProperties,

    revenueTrendRaw,
  ] = await Promise.all([
    // ⚠️ every query below is scoped with landlordId so a landlord only ever
    // sees their own data, never another landlord's properties/rentals/payments

    prisma.property.count({ where: { landlordId } }),
    prisma.property.count({
      where: { landlordId, status: PropertyStatus.AVAILABLE },
    }),
    prisma.property.count({
      where: { landlordId, status: PropertyStatus.RENTED },
    }),

    prisma.rentalRequest.count({ where: { property: { landlordId } } }),
    prisma.rentalRequest.count({
      where: { property: { landlordId }, status: RentalRequestStatus.PENDING },
    }),
    prisma.rentalRequest.count({
      where: { property: { landlordId }, status: RentalRequestStatus.APPROVED },
    }),
    prisma.rentalRequest.count({
      where: { property: { landlordId }, status: RentalRequestStatus.ACTIVE },
    }),
    prisma.rentalRequest.count({
      where: {
        property: { landlordId },
        status: RentalRequestStatus.COMPLETED,
      },
    }),

    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.SUCCESS,
        rentalRequest: { property: { landlordId } },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.SUCCESS,
        paidAt: { gte: monthStart, lt: monthEnd },
        rentalRequest: { property: { landlordId } },
      },
      _sum: { amount: true },
    }),

    prisma.review.aggregate({
      where: { property: { landlordId } },
      _avg: { rating: true },
      _count: { rating: true },
    }),

    prisma.rentalRequest.findMany({
      where: { property: { landlordId } },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, title: true, city: true } },
      },
    }),

    prisma.payment.findMany({
      where: { rentalRequest: { property: { landlordId } } },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        rentalRequest: {
          include: {
            tenant: { select: { id: true, name: true, email: true } },
            property: { select: { id: true, title: true } },
          },
        },
      },
    }),

    prisma.review.findMany({
      where: { property: { landlordId } },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { id: true, name: true } },
        property: { select: { id: true, title: true } },
      },
    }),

    // Only this landlord's properties — used below to compute top performers
    prisma.property.findMany({
      where: { landlordId },
      select: { id: true, title: true },
    }),

    Promise.all(
      monthRanges.map((range) =>
        prisma.payment.aggregate({
          where: {
            status: PaymentStatus.SUCCESS,
            paidAt: { gte: range.start, lt: range.end },
            rentalRequest: { property: { landlordId } },
          },
          _sum: { amount: true },
        }),
      ),
    ),
  ]);

  // ==============================
  // Top Performing Properties (this landlord's properties only)
  // Ranking: revenue → avg rating → rental count
  // ==============================
  const propertyPerformance = await Promise.all(
    landlordProperties.map(async (property) => {
      const [propRevenue, propReviewAgg, propRentalCount] = await Promise.all([
        prisma.payment.aggregate({
          where: {
            status: PaymentStatus.SUCCESS,
            rentalRequest: { propertyId: property.id },
          },
          _sum: { amount: true },
        }),
        prisma.review.aggregate({
          where: { propertyId: property.id },
          _avg: { rating: true },
          _count: { rating: true },
        }),
        prisma.rentalRequest.count({ where: { propertyId: property.id } }),
      ]);

      return {
        propertyId: property.id,
        title: property.title,
        revenue: Number(propRevenue._sum.amount ?? 0),
        averageRating: Number((propReviewAgg._avg.rating ?? 0).toFixed(1)),
        reviewCount: propReviewAgg._count.rating,
        rentals: propRentalCount,
      };
    }),
  );

  const topProperties = propertyPerformance
    .sort((a, b) => {
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      if (b.averageRating !== a.averageRating)
        return b.averageRating - a.averageRating;
      return b.rentals - a.rentals;
    })
    .slice(0, 5);

  const revenueTrend = monthRanges.map((range, i) => ({
    month: range.label,
    revenue: Number(revenueTrendRaw[i]?._sum.amount ?? 0),
  }));

  return {
    properties: {
      total: totalProperties,
      available: availableProperties,
      rented: rentedProperties,
    },

    rentals: {
      total: totalRentals,
      pending: pendingRentals,
      approved: approvedRentals,
      active: activeRentals,
      completed: completedRentals,
    },

    revenue: {
      totalRevenue: Number(revenueAgg._sum.amount ?? 0),
      monthlyRevenue: Number(monthlyRevenueAgg._sum.amount ?? 0),
      trend: revenueTrend,
    },

    reviews: {
      totalReviews: reviewAgg._count.rating,
      averageRating: Number((reviewAgg._avg.rating ?? 0).toFixed(1)),
    },

    recentRentalRequests,
    recentPayments,
    recentReviews,

    topProperties,
  };
};

export const LandlordService = {
  getDashboardFromDb,
};

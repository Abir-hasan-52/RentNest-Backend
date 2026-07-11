import {
  ApprovalStatus,
  PaymentStatus,
  PropertyStatus,
  RentalRequestStatus,
  Role,
  UserStatus,
} from "../../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";

// Returns 6 { label, start, end } ranges, oldest first, ending with the current month
const getLast6MonthRanges = () => {
  const ranges = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = start.toLocaleString("en-US", { month: "short", year: "numeric" });
    ranges.push({ label, start, end });
  }

  return ranges;
};

const getDashboardFromDb = async () => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthRanges = getLast6MonthRanges();

  const [
    totalUsers,
    totalAdmins,
    totalLandlords,
    totalTenants,
    newUsersThisMonth,
    bannedUsers,

    totalProperties,
    availableProperties,
    rentedProperties,
    newPropertiesThisMonth,

    pendingLandlordRequests,
    approvedLandlordRequests,
    rejectedLandlordRequests,

    totalRentals,
    pendingRentals,
    approvedRentals,
    rejectedRentals,
    activeRentals,
    completedRentals,
    avgRentalDuration,

    totalPayments,
    successPayments,
    pendingPayments,
    failedPayments,
    paymentRevenue,
    monthlyRevenue,

    totalReviews,
    averageRating,

    topLandlordsRaw,
    propertiesByCategory,
    propertiesByCity,

    recentRentalRequests,
    recentPayments,

    revenueTrendRaw,
    userGrowthTrendRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.user.count({ where: { role: Role.LANDLORD } }),
    prisma.user.count({ where: { role: Role.TENANT } }),
    prisma.user.count({ where: { createdAt: { gte: monthStart, lt: monthEnd } } }),
    prisma.user.count({ where: { status: UserStatus.BANNED } }),

    prisma.property.count(),
    prisma.property.count({ where: { status: PropertyStatus.AVAILABLE } }),
    prisma.property.count({ where: { status: PropertyStatus.RENTED } }),
    prisma.property.count({ where: { createdAt: { gte: monthStart, lt: monthEnd } } }),

    prisma.landlordRequest.count({ where: { status: ApprovalStatus.PENDING } }),
    prisma.landlordRequest.count({ where: { status: ApprovalStatus.APPROVED } }),
    prisma.landlordRequest.count({ where: { status: ApprovalStatus.REJECTED } }),

    prisma.rentalRequest.count(),
    prisma.rentalRequest.count({ where: { status: RentalRequestStatus.PENDING } }),
    prisma.rentalRequest.count({ where: { status: RentalRequestStatus.APPROVED } }),
    prisma.rentalRequest.count({ where: { status: RentalRequestStatus.REJECTED } }),
    prisma.rentalRequest.count({ where: { status: RentalRequestStatus.ACTIVE } }),
    prisma.rentalRequest.count({ where: { status: RentalRequestStatus.COMPLETED } }),
    prisma.rentalRequest.aggregate({ _avg: { rentalDuration: true } }),

    prisma.payment.count(),
    prisma.payment.count({ where: { status: PaymentStatus.SUCCESS } }),
    prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
    prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.SUCCESS },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.SUCCESS,
        paidAt: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
    }),

    prisma.review.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),

    prisma.property.groupBy({
      by: ["landlordId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),

    prisma.property.groupBy({
      by: ["categoryId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),

    prisma.property.groupBy({
      by: ["city"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),

    prisma.rentalRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, title: true, city: true } },
      },
    }),

    prisma.payment.findMany({
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

    // One aggregate query per month for revenue trend
    Promise.all(
      monthRanges.map((range) =>
        prisma.payment.aggregate({
          where: {
            status: PaymentStatus.SUCCESS,
            paidAt: { gte: range.start, lt: range.end },
          },
          _sum: { amount: true },
        })
      )
    ),

    // One count query per month for user growth trend
    Promise.all(
      monthRanges.map((range) =>
        prisma.user.count({
          where: { createdAt: { gte: range.start, lt: range.end } },
        })
      )
    ),
  ]);

  const topLandlordIds = topLandlordsRaw.map((l) => l.landlordId);
  const landlordDetails = topLandlordIds.length
    ? await prisma.user.findMany({
        where: { id: { in: topLandlordIds } },
        select: { id: true, name: true, email: true },
      })
    : [];

  const topLandlords = topLandlordsRaw.map((entry) => ({
    landlord: landlordDetails.find((l) => l.id === entry.landlordId),
    propertyCount: entry._count.id,
  }));

  const categoryIds = propertiesByCategory.map((c) => c.categoryId);
  const categoryDetails = categoryIds.length
    ? await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
      })
    : [];

  const categoryDistribution = propertiesByCategory.map((entry) => ({
    category: categoryDetails.find((c) => c.id === entry.categoryId)?.name ?? "Unknown",
    count: entry._count.id,
  }));

  const cityDistribution = propertiesByCity.map((entry) => ({
    city: entry.city,
    count: entry._count.id,
  }));

  const occupancyRate =
    totalProperties > 0
      ? Number(((rentedProperties / totalProperties) * 100).toFixed(1))
      : 0;

  const paymentSuccessRate =
    totalPayments > 0
      ? Number(((successPayments / totalPayments) * 100).toFixed(1))
      : 0;

  const approvedOrBeyond = approvedRentals + activeRentals + completedRentals;
  const rentalApprovalRate =
    totalRentals > 0 ? Number(((approvedOrBeyond / totalRentals) * 100).toFixed(1)) : 0;

  const activeUserRate =
    totalUsers > 0
      ? Number((((totalUsers - bannedUsers) / totalUsers) * 100).toFixed(1))
      : 0;

  const revenueTrend = monthRanges.map((range, i) => ({
    month: range.label,
    revenue: Number(revenueTrendRaw[i]._sum.amount ?? 0),
  }));

  const userGrowthTrend = monthRanges.map((range, i) => ({
    month: range.label,
    newUsers: userGrowthTrendRaw[i],
  }));

  return {
    users: {
      totalUsers,
      totalAdmins,
      totalLandlords,
      totalTenants,
      newUsersThisMonth,
      bannedUsers,
      activeUserRate, // percentage of non-banned users
    },

    properties: {
      totalProperties,
      availableProperties,
      rentedProperties,
      newPropertiesThisMonth,
      occupancyRate,
    },

    landlordRequests: {
      pending: pendingLandlordRequests,
      approved: approvedLandlordRequests,
      rejected: rejectedLandlordRequests,
    },

    rentals: {
      total: totalRentals,
      pending: pendingRentals,
      approved: approvedRentals,
      rejected: rejectedRentals,
      active: activeRentals,
      completed: completedRentals,
      approvalRate: rentalApprovalRate, // percentage
      avgDurationMonths: Number((avgRentalDuration._avg.rentalDuration ?? 0).toFixed(1)),
    },

    payments: {
      totalPayments,
      successPayments,
      pendingPayments,
      failedPayments,
      totalRevenue: Number(paymentRevenue._sum.amount ?? 0),
      monthlyRevenue: Number(monthlyRevenue._sum.amount ?? 0),
      successRate: paymentSuccessRate,
    },

    reviews: {
      totalReviews,
      averageRating: Number((averageRating._avg.rating ?? 0).toFixed(1)),
    },

    insights: {
      topLandlords,
      categoryDistribution,
      cityDistribution,
    },

    trends: {
      revenue: revenueTrend, // [{ month: "Feb 2026", revenue: 45000 }, ...]
      userGrowth: userGrowthTrend, // [{ month: "Feb 2026", newUsers: 12 }, ...]
    },

    recentRentalRequests,
    recentPayments,
  };
};

export const adminDashboardService = {
  getDashboardFromDb,
};
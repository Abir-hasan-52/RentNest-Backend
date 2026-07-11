// import {
//   LandlordRequestStatus,
//   PaymentStatus,
//   PropertyStatus,
//   Role,
//   RentalRequestStatus,
// } from "../../../generated/prisma/enums";
// import { prisma } from "../../lib/prisma";

import { ApprovalStatus, PaymentStatus, PropertyStatus, RentalRequestStatus, Role } from "../../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";

const getDashboardFromDb = async () => {
  const [
    // Users
    totalUsers,
    totalAdmins,
    totalLandlords,
    totalTenants,

    // Properties
    totalProperties,
    availableProperties,
    rentedProperties,

    // Landlord Requests
    pendingLandlordRequests,
    approvedLandlordRequests,
    rejectedLandlordRequests,

    // Rentals
    totalRentals,
    pendingRentals,
    approvedRentals,
    activeRentals,
    completedRentals,

    // Payments
    totalPayments,
    successPayments,
    pendingPayments,
    failedPayments,
    paymentRevenue,

    // Reviews
    totalReviews,
    averageRating,
  ] = await Promise.all([
    // ===========================
    // Users
    // ===========================
    prisma.user.count(),

    prisma.user.count({
      where: {
        role: Role.ADMIN,
      },
    }),

    prisma.user.count({
      where: {
        role: Role.LANDLORD,
      },
    }),

    prisma.user.count({
      where: {
        role: Role.TENANT,
      },
    }),

    // ===========================
    // Properties
    // ===========================
    prisma.property.count(),

    prisma.property.count({
      where: {
        status: PropertyStatus.AVAILABLE,
      },
    }),

    prisma.property.count({
      where: {
        status: PropertyStatus.RENTED,
      },
    }),

    // ===========================
    // Landlord Requests
    // ===========================
    prisma.landlordRequest.count({
      where: {
        status: ApprovalStatus.PENDING,
      },
    }),

    prisma.landlordRequest.count({
      where: {
        status: ApprovalStatus.APPROVED,
      },
    }),

    prisma.landlordRequest.count({
      where: {
        status: ApprovalStatus.REJECTED,
      },
    }),

    // ===========================
    // Rental Requests
    // ===========================
    prisma.rentalRequest.count(),

    prisma.rentalRequest.count({
      where: {
        status: RentalRequestStatus.PENDING,
      },
    }),

    prisma.rentalRequest.count({
      where: {
        status: RentalRequestStatus.APPROVED,
      },
    }),

    prisma.rentalRequest.count({
      where: {
        status: RentalRequestStatus.ACTIVE,
      },
    }),

    prisma.rentalRequest.count({
      where: {
        status: RentalRequestStatus.COMPLETED,
      },
    }),

    // ===========================
    // Payments
    // ===========================
    prisma.payment.count(),

    prisma.payment.count({
      where: {
        status: PaymentStatus.SUCCESS,
      },
    }),

    prisma.payment.count({
      where: {
        status: PaymentStatus.PENDING,
      },
    }),

    prisma.payment.count({
      where: {
        status: PaymentStatus.FAILED,
      },
    }),

    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.SUCCESS,
      },
      _sum: {
        amount: true,
      },
    }),

    // ===========================
    // Reviews
    // ===========================
    prisma.review.count(),

    prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    }),
  ]);

  return {
    users: {
      totalUsers,
      totalAdmins,
      totalLandlords,
      totalTenants,
    },

    properties: {
      totalProperties,
      availableProperties,
      rentedProperties,
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
      active: activeRentals,
      completed: completedRentals,
    },

    payments: {
      totalPayments,
      successPayments,
      pendingPayments,
      failedPayments,
      totalRevenue: Number(paymentRevenue._sum.amount ?? 0),
    },

    reviews: {
      totalReviews,
      averageRating: Number(
        (averageRating._avg.rating ?? 0).toFixed(1),
      ),
    },
  };
};

export const adminDashboardService = {
  getDashboardFromDb,
};
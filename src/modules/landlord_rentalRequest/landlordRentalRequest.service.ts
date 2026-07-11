import { addMonths } from "date-fns";
import { PropertyStatus, RentalRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { calculatePagination } from "../../utils/calculatePagination";
import { IUpdateRentalRequest } from "./landlordRentalRequest.interface";

const getAllRentalRequestsForLandlordFromDb = async (
  landlordId: string,
  query: Record<string, any>,
) => {
  const { page, limit, skip } = calculatePagination(query);

  const { status } = query;

  const where: any = {
    property: {
      landlordId,
    },
  };

  // Filter by status
  if (
    status &&
    Object.values(RentalRequestStatus).includes(status as RentalRequestStatus)
  ) {
    where.status = status;
  }

  const [requests, total] = await prisma.$transaction([
    prisma.rentalRequest.findMany({
      where,

      include: {
        tenant: {
          omit: {
            password: true,
          },
        },

        property: {
          include: {
            category: true,
            images: true,
          },
        },

        payment: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    }),

    prisma.rentalRequest.count({
      where,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },

    data: requests,
  };
};

const getSingleRentalRequestForLandlordFromDb = async (
  rentalRequestId: string,
  landlordId: string,
) => {
  const rentalRequest = await prisma.rentalRequest.findFirstOrThrow({
    where: {
      id: rentalRequestId,
      property: {
        landlordId,
      },
    },

    include: {
      tenant: {
        omit: {
          password: true,
        },
      },

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

      payment: true,

      review: {
        include: {
          tenant: {
            omit: {
              password: true,
            },
          },
        },
      },
    },
  });

  return rentalRequest;
};

 

const updateRentalRequestForLandlordFromDb = async (
  rentalRequestId: string,
  landlordId: string,
  payload: IUpdateRentalRequest,
) => {
  const { status } = payload;

  // Only APPROVED or REJECTED allowed
  if (
    status !== RentalRequestStatus.APPROVED &&
    status !== RentalRequestStatus.REJECTED
  ) {
    throw new Error(
      "Status must be either APPROVED or REJECTED."
    );
  }

  // Check request exists and belongs to this landlord
  const rentalRequest = await prisma.rentalRequest.findFirstOrThrow({
    where: {
      id: rentalRequestId,
      property: {
        landlordId,
      },
    },
  });

  // Already processed
  if (rentalRequest.status !== RentalRequestStatus.PENDING) {
    throw new Error("This rental request has already been processed.");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Approve Request
    const updatedRequest = await tx.rentalRequest.update({
      where: {
        id: rentalRequestId,
      },
      data: {
        status,
        approvedAt:
          status === RentalRequestStatus.APPROVED
            ? new Date()
            : null,
      },
      include: {
        tenant: {
          omit: {
            password: true,
          },
        },
        property: {
          include: {
            category: true,
            images: true,
          },
        },
      },
    });

    // If approved, reject all other pending requests
    if (status === RentalRequestStatus.APPROVED) {
      await tx.rentalRequest.updateMany({
        where: {
          propertyId: rentalRequest.propertyId,
          id: {
            not: rentalRequestId,
          },
          status: RentalRequestStatus.PENDING,
        },
        data: {
          status: RentalRequestStatus.REJECTED,
        },
      });
    }

    return updatedRequest;
  });

  return result;
};

const completeRentalFromDb = async (
  rentalRequestId: string,
  landlordId: string,
) => {
  // Get Rental Request
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: rentalRequestId,
    },
    include: {
      property: true,
    },
  });

  // Check Ownership
  if (rentalRequest.property.landlordId !== landlordId) {
    throw new Error(
      "You are not authorized to complete this rental.",
    );
  }

  // Rental must be ACTIVE
  if (rentalRequest.status !== RentalRequestStatus.ACTIVE) {
    throw new Error(
      "Only active rentals can be completed.",
    );
  }

  // Property must be RENTED
  if (rentalRequest.property.status !== PropertyStatus.RENTED) {
    throw new Error(
      "This property is not currently rented.",
    );
  }

  // Calculate Rental End Date
  const endDate = addMonths(
    rentalRequest.moveInDate,
    rentalRequest.rentalDuration,
  );

  // Cannot complete before rental period ends
  if (new Date() < endDate) {
    throw new Error(
      `Rental period has not ended yet. Rental ends on ${endDate.toDateString()}.`,
    );
  }

  // Complete Rental + Make Property Available
  const result = await prisma.$transaction(async (tx) => {
    const completedRental = await tx.rentalRequest.update({
      where: {
        id: rentalRequest.id,
      },
      data: {
        status: RentalRequestStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    await tx.property.update({
      where: {
        id: rentalRequest.propertyId,
      },
      data: {
        status: PropertyStatus.AVAILABLE,
      },
    });

    return completedRental;
  });

  return result;
};

 

export const landlordRentalRequestService = {
  getAllRentalRequestsForLandlordFromDb,
  getSingleRentalRequestForLandlordFromDb,
  updateRentalRequestForLandlordFromDb,
  completeRentalFromDb
};

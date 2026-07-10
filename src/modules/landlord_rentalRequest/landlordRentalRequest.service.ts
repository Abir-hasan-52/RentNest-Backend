import { RentalRequestStatus } from "../../../generated/prisma/enums";
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

 

export const landlordRentalRequestService = {
  getAllRentalRequestsForLandlordFromDb,
  getSingleRentalRequestForLandlordFromDb,
  updateRentalRequestForLandlordFromDb
};

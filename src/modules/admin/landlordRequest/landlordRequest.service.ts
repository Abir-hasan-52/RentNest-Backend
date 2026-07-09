import { ApprovalStatus, Role } from "../../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import { IUpdateLandlordRequest } from "./landlordRequest.interface";

const getAllLandlordRequestFromDb = async () => {
  const landlordResult = await prisma.landlordRequest.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return landlordResult;
};

const updateLandlordRequestFromDb = async (
  landlordRequestId: string,
  payload: IUpdateLandlordRequest,
) => {
  const { status, reviewNote } = payload;

  // Check request exists
  const request = await prisma.landlordRequest.findUniqueOrThrow({
    where: {
      id: landlordRequestId,
    },
  });

  const result = await prisma.$transaction(async (tx) => {
    // Update landlord request
    const updatedRequest = await tx.landlordRequest.update({
      where: {
        id: landlordRequestId,
      },
      data: {
        status,
        reviewNote,
      },
    });

    // Sync user role
    if (status === ApprovalStatus.APPROVED) {
      await tx.user.update({
        where: {
          id: request.userId,
        },
        data: {
          role: Role.LANDLORD,
        },
      });
    }

    if (status === ApprovalStatus.REJECTED) {
      await tx.user.update({
        where: {
          id: request.userId,
        },
        data: {
          role: Role.TENANT,
        },
      });
    }

    return updatedRequest;
  });

  return result;
};

export const landlordService = {
  getAllLandlordRequestFromDb,
  updateLandlordRequestFromDb,
};

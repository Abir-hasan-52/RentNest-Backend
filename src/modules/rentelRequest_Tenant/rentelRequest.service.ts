import {
  PropertyStatus,
  RentalRequestStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateRentalRequest } from "./rentelRequest.interface";

const createRentalRequestIntoDb = async (
  tenantId: string,
  payload: ICreateRentalRequest,
) => {
  const { propertyId, moveInDate, rentalDuration, message } = payload;

  // Validate Move-in Date
  const moveIn = new Date(moveInDate);

  if (isNaN(moveIn.getTime())) {
    throw new Error("Invalid move-in date.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (moveIn < today) {
    throw new Error("Move-in date cannot be in the past.");
  }

  // Validate Rental Duration
  if (rentalDuration <= 0) {
    throw new Error("Rental duration must be greater than 0.");
  }

  if (rentalDuration > 60) {
    throw new Error("Rental duration cannot exceed 60 months.");
  }

  // Check Property Exists
  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
  });

  // Property must be available
  if (property.status !== PropertyStatus.AVAILABLE) {
    throw new Error("This property is not available for rent.");
  }

  // Tenant cannot rent own property
  if (property.landlordId === tenantId) {
    throw new Error("You cannot rent your own property.");
  }

  // Duplicate Request Check
  const existingRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId,
      status: {
        in: [
          RentalRequestStatus.PENDING,
          RentalRequestStatus.APPROVED,
          RentalRequestStatus.ACTIVE,
        ],
      },
    },
  });

  if (existingRequest) {
    throw new Error(
      "You already have an active rental request for this property."
    );
  }

  // Calculate Total Amount
  const totalAmount = Number(property.rent) * rentalDuration;

  // Create Rental Request
  const rentalRequest = await prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId,
      moveInDate: moveIn,
      rentalDuration,
      monthlyRent: property.rent,
      totalAmount,
      message,
    },
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
  });

  return rentalRequest;
};

const getMyRentalRequestsFromDb = async (tenantId: string) => {
  const rentalRequests = await prisma.rentalRequest.findMany({
    where: {
      tenantId,
    },
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
      payment: true,
      review: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return rentalRequests;
};

export const rentalRequestService = {
  createRentalRequestIntoDb,
  getMyRentalRequestsFromDb
};
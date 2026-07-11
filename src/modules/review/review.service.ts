import { RentalRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateReview } from "./review.interface";

const createReviewIntoDb = async (
  tenantId: string,
  payload: ICreateReview,
) => {
  const { rentalRequestId, rating, comment } = payload;

  // Rating Validation
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  // Rental Request
  const rentalRequest = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: rentalRequestId,
    },
    include: {
      property: true,
      review: true,
    },
  });

  // Ownership Check
  if (rentalRequest.tenantId !== tenantId) {
    throw new Error(
      "You are not allowed to review this rental.",
    );
  }

  // Rental Completed?
  if (rentalRequest.status !== RentalRequestStatus.COMPLETED) {
    throw new Error(
      "Review can only be submitted after the rental is completed.",
    );
  }

  // Already Reviewed?
  if (rentalRequest.review) {
    throw new Error(
      "You have already reviewed this rental.",
    );
  }

  const review = await prisma.review.create({
    data: {
      rating,
      comment,

      tenantId,

      propertyId: rentalRequest.propertyId,

      rentalRequestId,
    },
    include: {
      property: true,

      tenant: {
        omit: {
          password: true,
        },
      },
    },
  });

  return review;
};

const getMyReviewsFromDb = async (tenantId: string) => {
  const reviews = await prisma.review.findMany({
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
      rentalRequest: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reviews;
};

 

export const reviewService = {
  createReviewIntoDb,
  getMyReviewsFromDb,
  
};
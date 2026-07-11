import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";
import httpStatus from "http-status";

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user!.id;

    const result = await reviewService.createReviewIntoDb(tenantId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Review submitted successfully.",
      data: result,
    });
  },
);

const getMyReviews = catchAsync(
  async (req: Request, res: Response) => {
    const tenantId = req.user!.id;

    const result = await reviewService.getMyReviewsFromDb(
      tenantId,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Reviews retrieved successfully.",
      data: result,
    });
  },
);

 

export const reviewController = {
  createReview,
  getMyReviews,
  
};

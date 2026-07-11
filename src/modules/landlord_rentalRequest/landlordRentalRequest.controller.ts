import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { landlordRentalRequestService } from "./landlordRentalRequest.service";
import httpStatus from "http-status"
const getAllRentalRequestsForLandlord = catchAsync(
  async (req: Request, res: Response,next:NextFunction) => {
    const landlordId = req.user!.id;

    const result =
      await landlordRentalRequestService.getAllRentalRequestsForLandlordFromDb(
        landlordId,
        req.query,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requests retrieved successfully.",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getSingleRentalRequestForLandlord = catchAsync(
  async (req: Request, res: Response,next:NextFunction) => {
    const { id } = req.params;
    const landlordId = req.user!.id;

    const result =
      await landlordRentalRequestService.getSingleRentalRequestForLandlordFromDb(
        id as string,
        landlordId,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental request retrieved successfully.",
      data: result,
    });
  },
);


const updateRentalRequestForLandlord = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const landlordId = req.user!.id;

    const result =
      await landlordRentalRequestService.updateRentalRequestForLandlordFromDb(
        id as string,
        landlordId,
        req.body,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental request updated successfully.",
      data: result,
    });
  },
);

const completeRental = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const landlordId = req.user!.id;

    const result =
      await landlordRentalRequestService.completeRentalFromDb(
        id as string,
        landlordId,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental completed successfully.",
      data: result,
    });
  },
);

export const landlordRentalRequestController={
    getAllRentalRequestsForLandlord,
    getSingleRentalRequestForLandlord,
    updateRentalRequestForLandlord,
    completeRental
}
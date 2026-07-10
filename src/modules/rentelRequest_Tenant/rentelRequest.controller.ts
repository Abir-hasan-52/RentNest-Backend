import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { rentalRequestService } from "./rentelRequest.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"

const createRentalRequest= catchAsync(async(req:Request, res:Response,next:NextFunction)=>{

    const tenantId = req.user!.id;

  const result = await rentalRequestService.createRentalRequestIntoDb(
    tenantId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental request submitted successfully.",
    data: result,
  });
})

const getMyRentalRequests = catchAsync(
  async (req: Request, res: Response,next:NextFunction) => {
    const tenantId = req.user!.id;
    const query=req.query
    const result =
      await rentalRequestService.getMyRentalRequestsFromDb(tenantId,query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requests retrieved successfully.",
      meta:result.meta,
      data: result.data,
    });
  },
);

const getSingleRentalRequest = catchAsync(
  async (req: Request, res: Response,next:NextFunction) => {
    const { id } = req.params;
    const tenantId = req.user!.id;

    const result =
      await rentalRequestService.getSingleRentalRequestFromDb(
        id as string,
        tenantId,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental request retrieved successfully.",
      data: result,
    });
  },
);

export const rentalRequestController={
    createRentalRequest,
    getMyRentalRequests,
    getSingleRentalRequest
    
}
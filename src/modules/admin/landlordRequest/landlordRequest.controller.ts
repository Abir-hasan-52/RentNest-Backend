import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { landlordService } from "./landlordRequest.service";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status"

const getAllLandlordRequest=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
const result = await landlordService.getAllLandlordRequestFromDb();
sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Landlord requests retrieved successfully.",
    data: result,
  });
})

export const landlordRequest={
    getAllLandlordRequest
}
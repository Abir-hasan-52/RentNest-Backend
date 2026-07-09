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

const updateLandlordRequest= catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const {id}=req.params;
    const payload=req.body;
    const result = await landlordService.updateLandlordRequestFromDb(id as string,payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Landlord request updated successfully.",
      data: result,
    });
});
const getSingleRequest= catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
      const { id } = req.params;

  const result = await landlordService.getSingleRequestFromDb(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Landlord request retrieved successfully.",
    data: result,
  });
});
const getOnlyMyRequest=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
     const userId = req.user?.id;

  const result = await landlordService.getOnlyMyRequest(userId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your landlord request retrieved successfully.",
    data: result,
  });
})


export const landlordController={
    getAllLandlordRequest,
    updateLandlordRequest,
    getSingleRequest,
    getOnlyMyRequest
}
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { propertyService } from "./property.server";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"

const createProperty= catchAsync(async (req:Request,res:Response,next:NextFunction)=>{
const landlordId = req.user!.id;
  const payload = req.body;

  const result = await propertyService.createPropertiesIntoDb(
    landlordId,
    payload
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Property created successfully.",
    data: result,
  });
});

const getMyProperty = catchAsync(async (req: Request, res: Response,next:NextFunction) => {
  const userId = req.user!.id;

  const result = await propertyService.getMyProperty(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your properties retrieved successfully.",
    data: result,
  });
});
const updateProperty = catchAsync(async (req: Request, res: Response,next:NextFunction) => {
  const { id } = req.params;
  const landlordId = req.user!.id;

  const result = await propertyService.updatePropertyIntoDb(
    id as string,
    landlordId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property updated successfully.",
    data: result,
  });
});
export const propertyController={
    createProperty,
    getMyProperty,
    updateProperty
}
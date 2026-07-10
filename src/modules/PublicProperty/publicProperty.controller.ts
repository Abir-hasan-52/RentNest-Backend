import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status"
import { publicPropertyService } from "./publicProperty.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const getAllProperties = catchAsync(async (req:Request, res:Response,next:NextFunction) => {
  const result = await publicPropertyService.getAllPropertiesFromDb(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Properties retrieved successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleProperty = catchAsync(async (req: Request, res: Response,next:NextFunction) => {
  const { id } = req.params;

  const result = await publicPropertyService.getSinglePropertyFromDb(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property retrieved successfully.",
    data: result,
  });
});

export const PublicPropertyController={
    getAllProperties,
    getSingleProperty
}
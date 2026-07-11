import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { adminDashboardService } from "./admin.service";
import httpStatus from "http-status"

const getDashboard = catchAsync(async (req:Request, res:Response,next:NextFunction) => {
  const result = await adminDashboardService.getDashboardFromDb();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Dashboard retrieved successfully.",
    data: result,
  });
});

export const adminDashboardController = {
  getDashboard,
};
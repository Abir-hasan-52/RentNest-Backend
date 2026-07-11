import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../utils/catchAsync";
import { tenantDashboardService } from "./tenant.service";
import { sendResponse } from "../../../utils/sendResponse";
// import catchAsync from "../../utils/catchAsync";
// import sendResponse from "../../utils/sendResponse";
// import { tenantDashboardService } from "./tenantDashboard.service";

const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;

  const result = await tenantDashboardService.getDashboardFromDb(tenantId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tenant dashboard fetched successfully",
    data: result,
  });
});

export const tenantDashboardController = {
  getDashboard,
};
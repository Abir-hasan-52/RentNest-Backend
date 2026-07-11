// import { Request, Response } from "express";
import httpStatus from "http-status";
 
import { LandlordService } from "./landlord.service";
import { catchAsync } from "../../../utils/catchAsync";
import { Request, Response } from "express";
import { sendResponse } from "../../../utils/sendResponse";

const getDashboard = catchAsync(async (req: Request, res: Response) => {
   
  const landlordId = req.user!.id;

  const result = await LandlordService.getDashboardFromDb(landlordId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Landlord dashboard fetched successfully",
    data: result,
  });
});

export const LandlordController = {
  getDashboard,
};
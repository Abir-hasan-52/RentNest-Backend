import { Request, Response } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.registerUserIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: result.landlordRequested
      ? "Registration successful. Your landlord request has been submitted for approval."
      : "User registration successful.",
    data: {
      user: result.user,
    },
  });
});

export const userController = {
  registerUser,
};

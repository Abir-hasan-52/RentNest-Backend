import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { categoryService } from "./category.service";
import httpStatus from "http-status";

const createCategory = catchAsync(async (req: Request, res: Response,next:NextFunction) => {
  const payload = req.body;
  

  const result = await categoryService.createCategoryIntoDb(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Category created successfully.",
    data: result,
  });
});

export const categoryController = {
  createCategory,
};

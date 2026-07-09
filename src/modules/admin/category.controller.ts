import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { categoryService } from "./category.service";
import httpStatus from "http-status";

const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const result = await categoryService.createCategoryIntoDb(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Category created successfully.",
      data: result,
    });
  },
);

const getAllCategoryList = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await categoryService.getAllCategoryFromDb();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Categories retrieved successfully.",
      data: result,
    });
  },
);

const updateCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await categoryService.updateCategoryFromDb(
      id as string,
      payload,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category updated successfully.",
      data: result,
    });
  },
);

const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await categoryService.deleteCategoryFromDb(id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category deleted successfully.",
      data: null,
    });
  },
);

export const categoryController = {
  createCategory,
  getAllCategoryList,
  updateCategories,
  deleteCategory,
};

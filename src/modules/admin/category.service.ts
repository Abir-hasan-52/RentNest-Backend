import { prisma } from "../../lib/prisma";
import { ICreateCategory, IUpdateCategory } from "./category.interface";

const createCategoryIntoDb = async (payload: ICreateCategory) => {
  const { name, description } = payload;
  const category = await prisma.category.findUnique({
    where: {
      name,
    },
  });
  if (category) {
    throw new Error("Already exist this category");
  }

  const createCategory = await prisma.category.create({
    data: {
      name,
      description,
    },
  });
  return createCategory;
};

const getAllCategoryFromDb = async () => {
  return await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateCategoryFromDb = async (id: string, payload: IUpdateCategory) => {
  await prisma.category.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updatedCategory = await prisma.category.update({
    where: {
      id,
    },
    data: payload,
  });

  return updatedCategory;
};

const deleteCategoryFromDb = async (categoryId: string) => {
  await prisma.category.findUniqueOrThrow({
    where: {
      id: categoryId,
    },
  });
  const deleteCategory = await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
  return null;
};
export const categoryService = {
  createCategoryIntoDb,
  getAllCategoryFromDb,
  updateCategoryFromDb,
  deleteCategoryFromDb,
};

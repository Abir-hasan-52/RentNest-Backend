import { Router } from "express";
import { categoryController } from "./category.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();
router.post("/categories", auth(Role.ADMIN), categoryController.createCategory);
router.get("/categories",categoryController.getAllCategoryList);
router.patch("/categories/:id",auth(Role.ADMIN), categoryController.updateCategories)
router.delete("/categories/:id",auth(Role.ADMIN),categoryController.deleteCategory)
export const categoryRouter = router;
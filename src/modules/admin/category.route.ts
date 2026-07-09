import { Router } from "express";
import { categoryController } from "./category.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();
router.post("/category", auth(Role.ADMIN), categoryController.createCategory);
export const categoryRouter = router;
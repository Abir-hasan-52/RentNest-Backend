import { Router } from "express";
import { auth } from "../../../middlewares/auth";
import { Role } from "../../../../generated/prisma/enums";
import { adminDashboardController } from "./admin.controller";


const router= Router()
router.get(
  "/dashboard",
  auth(Role.ADMIN),
  adminDashboardController.getDashboard,
);

export const adminDashboardRouter=router;
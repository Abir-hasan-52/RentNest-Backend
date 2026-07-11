import express from "express";
import { auth } from "../../../middlewares/auth";
import { Role } from "../../../../generated/prisma/enums";
import { tenantDashboardController } from "./tenant.controller";
 

const router = express.Router();

router.get("/dashboard", auth(Role.TENANT), tenantDashboardController.getDashboard);

export const tenantDashboardRoutes = router;
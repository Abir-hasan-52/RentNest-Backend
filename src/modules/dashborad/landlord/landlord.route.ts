 import express from "express";
import { LandlordController } from "./landlord.controller";
import { auth } from "../../../middlewares/auth";
import { Role } from "../../../../generated/prisma/enums";

const router = express.Router();

router.get("/dashboard", auth(Role.LANDLORD), LandlordController.getDashboard);

export const LandlordDashboardRoutes = router;
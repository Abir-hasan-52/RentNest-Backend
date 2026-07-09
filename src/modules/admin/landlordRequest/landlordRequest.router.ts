import { Router } from "express";
import { auth } from "../../../middlewares/auth";
import { Role } from "../../../../generated/prisma/enums";
import { landlordRequest } from "./landlordRequest.controller";

const router= Router()
router.get("/landlord-request",auth(Role.ADMIN),landlordRequest.getAllLandlordRequest);
export const landlordRouter= router;
import { Router } from "express";
import { auth } from "../../../middlewares/auth";
import { Role } from "../../../../generated/prisma/enums";
import { landlordController } from "./landlordRequest.controller";

const router= Router()
router.get(
  "/landlord-request",
  auth(Role.ADMIN),
  landlordController.getAllLandlordRequest
);

router.get(
  "/landlord-request/me",
  auth(Role.LANDLORD, Role.TENANT),
  landlordController.getOnlyMyRequest
);

router.get(
  "/landlord-request/:id",
  auth(Role.ADMIN),
  landlordController.getSingleRequest
);

router.patch(
  "/landlord-request/:id",
  auth(Role.ADMIN),
  landlordController.updateLandlordRequest
);
export const landlordRouter= router;
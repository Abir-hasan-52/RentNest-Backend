import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { landlordRentalRequestController } from "./landlordRentalRequest.controller";

const router = Router();

router.get(
  "/rental-requests",
  auth(Role.LANDLORD),
  landlordRentalRequestController.getAllRentalRequestsForLandlord,
);

router.get(
  "/rental-requests/:id",
  auth(Role.LANDLORD),
  landlordRentalRequestController.getSingleRentalRequestForLandlord,
);
router.patch(
  "/rental-requests/:id",
  auth(Role.LANDLORD),
  landlordRentalRequestController.updateRentalRequestForLandlord,
);

export const landlordRentalRequestRouter = router;

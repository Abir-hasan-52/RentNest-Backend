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

router.patch(
  "/rental-requests/:id/complete",
  auth(Role.LANDLORD),
  landlordRentalRequestController.completeRental,
);

export const landlordRentalRequestRouter = router;

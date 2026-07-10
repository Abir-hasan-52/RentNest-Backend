import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { rentalRequestController } from "./rentelRequest.controller";

const router= Router();
router.post("/rentals",auth(Role.TENANT),rentalRequestController.createRentalRequest)
router.get(
  "/rentals",
  auth(Role.TENANT),
  rentalRequestController.getMyRentalRequests
);
router.get(
  "/rentals/:id",
  auth(Role.TENANT),
  rentalRequestController.getSingleRentalRequest,
);
export const rentalRequestRouter=router;
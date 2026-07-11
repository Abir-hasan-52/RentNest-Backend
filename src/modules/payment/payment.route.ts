import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { PaymentController } from "./payment.controller";

const router = Router();

router.post(
  "/create",
  auth(Role.TENANT),
  PaymentController.createCheckoutSession,
);

router.get("/me", auth(Role.TENANT), PaymentController.getMyPayments);
router.get(
  "/me/:id",
  auth(Role.TENANT),
  PaymentController.getSinglePayment,
);

export const paymentRouter = router;

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

export const paymentRouter = router;
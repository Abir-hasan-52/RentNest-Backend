import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { reviewController } from "./review.controller";

const router = Router();

router.post(
  "/reviews",
  auth(Role.TENANT),
  reviewController.createReview,
);
router.get(
  "/reviews/my",
  auth(Role.TENANT),
  reviewController.getMyReviews,
);

export const reviewRouter = router;
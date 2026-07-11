import { Router } from "express";
import { PublicPropertyController } from "./publicProperty.controller";
 

const router = Router();
router.get("/properties", PublicPropertyController.getAllProperties);
router.get("/properties/:id", PublicPropertyController.getSingleProperty);
router.get("/properties/:id/reviews",PublicPropertyController.getPropertyReviews,);
export const publicPropertyRouter = router;

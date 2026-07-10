import { Router } from "express";
import { PublicPropertyController } from "./publicProperty.controller";

const router = Router();
router.use("/properties", PublicPropertyController.getAllProperties);

export const publicPropertyRouter = router;

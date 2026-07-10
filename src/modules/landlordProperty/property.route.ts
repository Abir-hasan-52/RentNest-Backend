import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { propertyController } from "./property.controller";

const router= Router();
router.post("/properties",auth(Role.LANDLORD),propertyController.createProperty);
router.get("/properties",auth(Role.LANDLORD),propertyController.getMyProperty);

router.patch(
  "/properties/:id",
  auth(Role.LANDLORD),
  propertyController.updateProperty
);
router.delete(
  "/properties/:id",
  auth(Role.LANDLORD),
  propertyController.deleteProperty,
);

 

export const propertyRouter=router;
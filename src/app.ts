import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";

import { userRouter } from "./modules/user/user.route";
import { authRouter } from "./modules/auth/auth.route";
import { categoryRouter } from "./modules/admin/category.route";
import { landlordRouter } from "./modules/admin/landlordRequest/landlordRequest.router";
import { propertyRouter } from "./modules/landlordProperty/property.route";
import { publicPropertyRouter } from "./modules/PublicProperty/publicProperty.route";
import { rentalRequestRouter } from "./modules/rentelRequest_Tenant/rentelRequest.route";
import { landlordRentalRequestRouter } from "./modules/landlord_rentalRequest/landlordRentalRequest.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the RentNest API!");
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

app.use("/api/admin", categoryRouter);

app.use("/api/admin", landlordRouter);
app.use("/api/landlord", propertyRouter);
app.use("/api/public", publicPropertyRouter);
app.use("/api/tenant", rentalRequestRouter);
app.use("/api/landlord", landlordRentalRequestRouter);
export default app;

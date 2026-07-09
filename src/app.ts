import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import httpStatus from "http-status";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import { Role, ApprovalStatus } from "../generated/prisma/enums";
import { userRouter } from "./modules/user/user.route";
import { authRouter } from "./modules/auth/auth.route";
import { categoryRouter } from "./modules/admin/category.route";
// import { Role } from "../generated/prisma/browser";

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

export default app;

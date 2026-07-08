import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import httpStatus from "http-status";

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

app.post("/api/user/register", (req: Request, res: Response) => {
  const payload = req.body;
  console.log(payload);
  res
    .status(httpStatus.CREATED)
    .json({ message: "User registration endpoint",payload: payload });
});
export default app;

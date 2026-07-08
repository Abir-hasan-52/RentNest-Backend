import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import httpStatus from "http-status";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import { Role, ApprovalStatus } from "../generated/prisma/enums";
import { userRouter } from "./modules/user/user.route";
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

// app.post("/api/user/register", async (req: Request, res: Response) => {
//   const {
//     name,
//     email,
//     password,
//     phone,
//     profileImage,
//     address,
//     role,
//     nidNumber,
//     tradeLicense,
//     reason,
//   } = req.body;

//   // Check Existing User
//   const isUserExists = await prisma.user.findUnique({
//     where: {
//       email,
//     },
//   });

//   if (isUserExists) {
//     throw new AppError(
//       httpStatus.CONFLICT,
//       "User already exists with this email."
//     );
//   }

//   // Admin Registration Not Allowed
//   if (role === Role.ADMIN) {
//     throw new AppError(
//       httpStatus.FORBIDDEN,
//       "You cannot register as an admin."
//     );
//   }

//   // Hash Password
//   const hashedPassword = await bcrypt.hash(
//     password,
//     Number(config.bcrypt_salt_rounds)
//   );

//   const result = await prisma.$transaction(async (tx) => {
//     // Always create as TENANT
//     const user = await tx.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         phone,
//         profileImage,
//         address,
//         role: Role.TENANT,
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         phone: true,
//         profileImage: true,
//         address: true,
//         role: true,
//         status: true,
//         createdAt: true,
//       },
//     });

//     // If user requested landlord
//     if (role === Role.LANDLORD) {
//       await tx.landlordRequest.create({
//         data: {
//           userId: user.id,
//           nidNumber,
//           tradeLicense,
//           reason,
//           status: ApprovalStatus.PENDING,
//         },
//       });
//     }

//     return user;
//   });

//   return {
//     user: result,
//     landlordRequested: role === Role.LANDLORD,
//   };
// };

//   res.status(httpStatus.CREATED).json({
//     success: true,
//     statuscode: httpStatus.CREATED,
//     message: "User registration successful.",
//     data: {
//       user,
//     },
//   });
// });

app.use("/api/user",userRouter);


export default app;

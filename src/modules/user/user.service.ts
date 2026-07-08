import bcrypt from "bcryptjs";
import httpStatus from "http-status";

import { prisma } from "../../lib/prisma";

import config from "../../config";
import { ApprovalStatus, Role } from "../../../generated/prisma/enums";
import { IRegisterUserPayload } from "./user.interface";



const registerUserIntoDB = async (payload: IRegisterUserPayload) => {
  const {
    name,
    email,
    password,
    phone,
    profileImage,
    address,
    role,
    nidNumber,
    tradeLicense,
    reason,
  } = payload;

  // Check Existing User
  const isUserExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isUserExists) {
    throw new Error("User already exists with this email.");
  }

  // Admin Registration Not Allowed
  if (role === Role.ADMIN) {
    throw new Error("You cannot register as an admin.");
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await prisma.$transaction(async (tx) => {
    // Always create as TENANT
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        profileImage,
        address,
        role: Role.TENANT,
      },
       omit:{
        password:true
       }
    });

    // If user requested landlord
    if (role === Role.LANDLORD) {
      await tx.landlordRequest.create({
        data: {
          userId: user.id,
          nidNumber,
          tradeLicense,
          reason,
          status: ApprovalStatus.PENDING,
        },
      });
    }

    return user;
  });

  return {
    user: result,
    landlordRequested: role === Role.LANDLORD,
  };
};

export const userService = {
  registerUserIntoDB,
};

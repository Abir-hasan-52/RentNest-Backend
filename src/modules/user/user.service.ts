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
    const CreateUser = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        profileImage,
        address,
        role: Role.TENANT,
      },
      omit: {
        password: true,
      },
    });

    // If user requested landlord
    if (role === Role.LANDLORD) {
      await tx.landlordRequest.create({
        data: {
          userId: CreateUser.id,
          nidNumber,
          tradeLicense,
          reason,
          status: ApprovalStatus.PENDING,
        },
      });
    }
    // Return Fresh User with Relation
    const user = await tx.user.findUnique({
      where: {
        id: CreateUser.id,
      },
      include: {
        landlordRequest: {
          select: {
            reason: true,
            status: true,
            nidNumber: true,
            tradeLicense: true,
          },
        },
      },
      omit: {
        password: true,
      },
    });

    return user;
  });

  return {
    user: result,
    landlordRequested: role === Role.LANDLORD,
  };
};

const getMyProfileFromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
  });
  return user;
};

const updateMyProfileInDB = async (userId: string, payload: any) => {
  const { name, phone, profileImage, address } = payload;

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name,
      phone,
      profileImage,
      address,
    },
    omit: {
      password: true,
    },
  });
  return updatedUser;
};

export const userService = {
  registerUserIntoDB,
  getMyProfileFromDB,
  updateMyProfileInDB,
};

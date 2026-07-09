import { Role } from "../../../generated/prisma/enums";

export interface IRegisterUserPayload {
  name?: string;
  email: string;
  password: string;
  phone?: string;
  profileImage?: string;
  address?: string;
  role?: Role;
  nidNumber?: string;
  tradeLicense?: string;
  reason?: string;
}
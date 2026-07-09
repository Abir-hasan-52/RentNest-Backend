import { ApprovalStatus } from "../../../../generated/prisma/enums";

export interface IUpdateLandlordRequest {
  status: ApprovalStatus;
  reviewNote?: string;
}
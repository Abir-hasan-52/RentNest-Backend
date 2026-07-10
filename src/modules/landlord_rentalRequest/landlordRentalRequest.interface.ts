import { RentalRequestStatus } from "../../../generated/prisma/enums";

export interface IUpdateRentalRequest {
  status: RentalRequestStatus;
}
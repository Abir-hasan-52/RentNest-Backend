export interface ICreateRentalRequest {
  propertyId: string;
  moveInDate: Date;
  rentalDuration: number;
  message?: string;
}
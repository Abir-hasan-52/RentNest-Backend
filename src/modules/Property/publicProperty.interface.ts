// import { PropertyStatus } from "../../../../generated/prisma/enums";

export interface IPropertyQuery {
  search?: string;
  city?: string;
  categoryId?: string;
  status?: PropertyStatus;
  bedrooms?: string;
  furnished?: string;
  parking?: string;
  minRent?: string;
  maxRent?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
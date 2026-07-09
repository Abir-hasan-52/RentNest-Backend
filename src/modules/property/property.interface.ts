import { PropertyStatus } from "../../../generated/prisma/enums";

export interface ICreateProperty {
  title: string;
  description: string;
  address: string;
  city: string;
  area?: number;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  furnished?: boolean;
  parking?: boolean;
  availableFrom?: Date;
  categoryId: string;

  imageUrls: string[];
}

export interface IUpdateProperty {
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  area?: number;
  rent?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  parking?: boolean;
  availableFrom?: Date;
  status?: PropertyStatus;
  categoryId?: string;
  imageUrls?: string[];
}
import { PropertyStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateProperty, IUpdateProperty } from "./property.interface";

const createPropertiesIntoDb = async (
  landlordId: string,
  payload: ICreateProperty,
) => {
  const {
    title,
    description,
    address,
    city,
    area,
    rent,
    bedrooms,
    bathrooms,
    furnished,
    parking,
    availableFrom,
    categoryId,
    imageUrls,
  } = payload;

  // Check Category Exists
  await prisma.category.findUniqueOrThrow({
    where: {
      id: categoryId,
    },
  });

  const result = await prisma.$transaction(async (tx) => {
    // Create Property
    const property = await tx.property.create({
      data: {
        title,
        description,
        address,
        city,
        area,
        rent,
        bedrooms,
        bathrooms,
        furnished,
        parking,
        availableFrom,
        landlordId,
        categoryId,
      },
    });

    // Create Images
    if (imageUrls?.length) {
      await tx.propertyImage.createMany({
        data: imageUrls.map((url) => ({
          imageUrl: url,
          propertyId: property.id,
        })),
      });
    }
    // at least one image
    if (imageUrls.length === 0) {
      throw new Error("At least one property image is required.");
    }

    return await tx.property.findUnique({
      where: {
        id: property.id,
      },
      include: {
        category: true,

        images: true,

        landlord: {
          omit: {
            password: true,
          },
        },
      },
    });
  });

  return result;
};

const getMyProperty = async (Id: string) => {
  const myProperties = await prisma.property.findMany({
    where: {
      landlordId: Id,
    },
    include: {
      category: true,
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return myProperties;
};

const updatePropertyIntoDb = async (
  propertyId: string,
  landlordId: string,
  payload: IUpdateProperty,
) => {
  const { imageUrls, ...propertyData } = payload;

  const property = await prisma.property.findFirstOrThrow({
    where: {
      id: propertyId,
      landlordId,
    },
  });

  if (propertyData.categoryId) {
    await prisma.category.findUniqueOrThrow({
      where: {
        id: propertyData.categoryId,
      },
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.property.update({
      where: {
        id: propertyId,
      },
      data: propertyData,
    });

    if (imageUrls) {
      await tx.propertyImage.deleteMany({
        where: {
          propertyId,
        },
      });

      if (imageUrls.length > 0) {
        await tx.propertyImage.createMany({
          data: imageUrls.map((url) => ({
            imageUrl: url,
            propertyId,
          })),
        });
      }
    }

    return await tx.property.findUnique({
      where: {
        id: propertyId,
      },
      include: {
        category: true,
        images: true,
      },
    });
  });

  return result;
};

const deletePropertyFromDb = async (propertyId: string, landlordId: string) => {
  await prisma.property.findFirstOrThrow({
    where: {
      id: propertyId,
      landlordId,
    },
  });

  await prisma.property.delete({
    where: {
      id: propertyId,
    },
  });

  return null;
};

export const propertyService = {
  createPropertiesIntoDb,
  getMyProperty,
  updatePropertyIntoDb,
  deletePropertyFromDb,
};

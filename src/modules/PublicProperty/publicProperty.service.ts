import { PropertyStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IPropertyQuery } from "./publicProperty.interface";


const getAllPropertiesFromDb = async (query: IPropertyQuery) => {
  const {
    search,
    city,
    categoryId,
    status,
    bedrooms,
    furnished,
    parking,
    minRent,
    maxRent,
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    status: PropertyStatus.AVAILABLE,
  };

  // Search
  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        city: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        address: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (city) {
    where.city = {
      contains: city,
      mode: "insensitive",
    };
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (status) {
    where.status = status;
  }

  if (bedrooms) {
    where.bedrooms = Number(bedrooms);
  }

  if (furnished !== undefined) {
    where.furnished = furnished === "true";
  }

  if (parking !== undefined) {
    where.parking = parking === "true";
  }

  if (minRent || maxRent) {
    where.rent = {};

    if (minRent) {
      where.rent.gte = Number(minRent);
    }

    if (maxRent) {
      where.rent.lte = Number(maxRent);
    }
  }

  const properties = await prisma.property.findMany({
    where,
    include: {
      category: true,
      images: true,
      landlord: {
        omit: {
          password: true,
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.property.count({
    where,
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data: properties,
  };
};

const getSinglePropertyFromDb = async (propertyId: string) => {
  const property = await prisma.property.findFirstOrThrow({
    where: {
      id: propertyId,
      status: PropertyStatus.AVAILABLE,
    },
    include: {
      category: true,
      images: true,
      landlord: {
        omit: {
          password: true,
        },
      },
      reviews: {
        include: {
          tenant: {
            omit: {
              password: true,
            },
          },
        },
      },
    },
  });

  return property;
};

export const publicPropertyService={
    getAllPropertiesFromDb,
    getSinglePropertyFromDb
}
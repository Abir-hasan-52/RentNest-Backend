import { prisma } from "../../../lib/prisma";

const getAllLandlordRequestFromDb= async()=>{

    const landlordResult = await prisma.landlordRequest.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return landlordResult
}

export const landlordService={
    getAllLandlordRequestFromDb
}
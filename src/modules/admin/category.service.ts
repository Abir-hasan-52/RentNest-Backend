import { prisma } from "../../lib/prisma";
import { ICreateCategory } from "./category.interface";

 

const createCategoryIntoDb = async (payload: ICreateCategory) => {
    const { name, description } = payload;
    const category = await prisma.category.findUnique({
        where:{
            name
        }
    })
    if(category){
        throw new Error("Already exist this category")
    }
     
    const createCategory= await prisma.category.create({
        data:{
            name,
            description
        }
    })
    return createCategory

}
export const categoryService = {
    createCategoryIntoDb,
}
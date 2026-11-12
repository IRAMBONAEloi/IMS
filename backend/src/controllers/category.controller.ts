import type { Request, Response } from 'express';
import { prisma } from '../index.js';
import { createCategorySchema , updateCategorySchema} from '../utils/validation.js';

export class categoryController{
    async getAll(req:Request, res:Response){

        try{
            const categories = await prisma.category.findMany({
                include: {
                    _count:{
                        select:{
                            products: true
                        }
                    }
                }   
            });
            res.json({ success: true, data: categories});
        } catch (error){
            console.log('Error getting categories:', error);
            res.status(500).json({message :'server error'});
        
    }
}

async getOne(req: Request , res: Response){

try{
    const id = parseInt(req.params.id as string);
    
    const category = await prisma.category.findUnique({
        where:{ id },
        include : {products : true}
    });

    if (!category){
        return res.status(404).json({message: 'Category not found'});
    }


    res.json({success:true, data:category});

}

catch (error){
    console.log('Erroe getting category:',error);
    res.status(500).json({message:'Server error'});
}

}


async create(req:Request , res:Response){
    try{


        const validation = createCategorySchema.safeParse(req.body);
        if(!validation.success){

            return res.status(400).json({
                success: false,
                errors:validation.error
            })
        }


        const {name, description} = validation.data;

        const createData: any = {name};
        if (description !== undefined) createData.description = description;
        const category = await prisma.category.create({
            data: createData
               
            
        });
        res.status(201).json({success:true, data :category});
    }catch (error){
        console.log('Create category error:',error);
        res.status(500).json({message:'Server error'});
    }
}

async update(req:Request , res:Response){
    try{
        const id = parseInt(req.params.id as string);

        const validation = updateCategorySchema.safeParse(req.body);

        if(!validation.success){
            return res.status(400).json({
                 success: false,
            error: validation.error
            });
           
        }
        const {name, description} = validation.data;
        const updateData: any = {};
        if (validation.data.name !== undefined) updateData.name = validation.data.name;
        if(validation.data.description !== undefined)updateData.description = validation.data.description;

        const category = await prisma.category.update({
            where: {id},
            data:updateData 
        });
        
        res.json({success:true, data: category});
        
    }catch(error){
        console.error('Update category error:', error);
        res.status(500).json({message:'Server error'});
    }
}


async delete(req:Request, res:Response){
    try{
        const id = parseInt(req.params.id as string);

        await prisma.category.delete({
            where: {id}
        });
        res.json({success:true, message:'Category deleted successfully'});
    
        } catch(error){
            console.log('Delete category error:', error);
            res.status(500).json({message:'Server error'});
        }
    
    }
}
import type { Request, Response } from 'express';
import { prisma } from '../index.js';

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
        const {name, description} = req.body;
        const category = await prisma.category.create({
            data: {
                name,
                description
            }
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
        
        const {name, description} = req.body;

        const category = await prisma.category.update({
            where: {id},
            data: {
                name, 
                description
            }
        });
        
        res.json({success:true, data: category});
        
    }catch(error){
        console.log('Update category error:', error);
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
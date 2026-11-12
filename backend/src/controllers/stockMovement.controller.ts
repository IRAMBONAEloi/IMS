import  type{Request, Response} from 'express';
import {prisma} from '../index.js';
import { createStockMovementSchema } from '../utils/validation.js';





export class StockMovementController{

//Create stock movement
    async create(req:Request, res:Response){

        try{


            const validation = createStockMovementSchema.safeParse(req.body);
            if(!validation.success){
                return res.status(400).json({
                    success:false,
                    errors:validation.error
                });
            }


            const {productId, movementType, quantity, reason, reference}= validation.data;
            const userId = (req as any).user?.id;
            if(!userId){
                return res.status(401).json({message:'User not authenticated '});
            }

            if (quantity <= 0){

                return res.status(400).json({message:'Quantity must be greater than zero' });

            }


            //start transaction
            const result = await prisma.$transaction(async (tx) =>{

                //get current product
                const product =await tx.product.findUnique({
                    where: {id:productId}
                });

                if (!product) {
                    throw new Error ('Product not found');
                }

                const previousStock = product.currentStock;
                let newStock = previousStock;

//calculate new stock based on movement type
                switch (movementType){

                    case 'STOCK_IN':
                        newStock = previousStock + quantity;
                        break;

                    case 'STOCK_OUT':
                        if(previousStock < quantity){
                            throw new Error(`Insufficient stock for this movement. Available :${previousStock}, Requested: ${quantity}`);
                        }
                        newStock = previousStock - quantity;
                        break;
                    case 'ADJUSTMENT':
                        newStock = quantity;
                        break;
                    case'RETURN':
                    newStock =previousStock + quantity;
                    break;

                    default:
                        throw new Error('Invalid movement type');
                }

                //update product stock

                await tx.product.update({
                    where: {id:productId},
                    data: {currentStock: newStock}
                });

              //creation of stock m. 

                    const movement = await tx.stockMovement.create({
                        data:{
                        productId,
                        movementType,
                        quantity,
                        previousStock,
                        newStock,
                        ...(reason && {reason}),
                        ...(reference && {reference}),
                        userId
                        },

                        include :{
                            product:{
                                select: {name:true, SKU:true}
                            },
                            user: {
                                select: {name:true}
                            }
                        }
                    });
                    return movement;
                });

               return res.status(201).json({success:true, data:result});

        } catch (error: any ) {
            /*console.error('Creating stock movement error', error);
           return res.status(500).json({message:'Server error'});

            if (error.message.includes('Insufficient stock')) {
             return   res.status(400).json({message:error.message});*/
    


             if (error.message?.includes('Products not found')){
                return res.status(404).json({message:error.message});
             }
             if (error.message?.includes('Insufficient stock')){
                return res.status(400).json({message: error.message});
             }

             if (error.message?.includes('Invalid movement type')){
                return res.status(400).json({message:error.message});
             }

             if (error.message?.includes('Missing required fields')){
                return res.status(400).json({message:error.message});
             }
               res.status(500).json({message:'Server error'});
        }
      
    }


//Get stock M. history 

async getAll(req:Request, res:Response){

    try{

        const {productId, movementType, startDate, endDate}= req.query;

        const where : any = {};

        if(productId) where.productId = Number(productId);
        if(movementType) where.movementType = movementType;

        if(startDate || endDate) {


            where.createdAt = {};

            if (startDate) where.createdAt.gte = new Date(startDate as string);
            if(endDate) where.createdAt.lte= new Date(endDate as string);
        }


        const movements = await prisma.stockMovement.findMany({

            where,
            include : {
                product:{
                    select:{name:true,SKU:true}  
                },
                user:{
                    select:{name:true}

                }
            },
            orderBy:{createdAt:'desc'}
        });

      return  res.json({success:true, data: movements});
        
    } catch (error){
        console.error('Getting stock movements error', error);
      return  res.status(500).json({message:'Server error'});
    }
    }
}
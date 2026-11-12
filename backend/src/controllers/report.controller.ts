import type {Request, Response} from 'express';
import { prisma } from '../index.js';


export class ReportController{

async getLowStock (req:Request, res:Response){

    try{
         
const products = await prisma.product.findMany({
    where: {
        status: 'ACTIVE',
        currentStock: {
            lte: prisma.product.fields.minimumStock
        }
    },
    include: {
        category: true,
        supplier: true
    },
orderBy: {currentStock:'asc'}
});

res.json({


    success:true,
    count: products.length,
    data:products
});


    }catch (error){
        console.error('Low stock report error :', error);
        res.status(500).json({message:'Server eror'});
    }
}


async getOutOfStock(req: Request, res:Response){


    try{
        const products =await prisma.product.findMany({
            where: {
                status:'ACTIVE',
                currentStock: 0
            },


            include: {
                category:true,
                supplier:true
            },
            orderBy: {name : 'asc'}
        });




        res.json({
            success:true, count:products.length,data:products
        });

    }catch (error){
        console.error('Out of stock report error:', error);
        res.status(500).json({message:'Server error'});
    }
}



async getInventoryValue(req:Request, res:Response){

    try{


        const products = await prisma.product.findMany({
            where:{
                status:'ACTIVE',
                currentStock: {gt: 0 }
            },
            select:{
                id:true,
                name:true,
                SKU:true,
                currentStock:true,
                unitPrice:true,
                category:{
                    select:{name:true}
                }
            },
            orderBy:{name:'asc'}
        });


        const inventoryItems = products.map(product =>({
            ...product,
            totalValue:product.currentStock * product.unitPrice
        }));

        const totalValue = inventoryItems.reduce((sum,item) => sum + item.totalValue,0);


        res.json({
            success:true, data:{
               items:inventoryItems,
               summary: {
                totalProducts: products.length,
                totalValue: totalValue,
                averageValuePerProduct: products.length > 0 ? totalValue / products.length :0
               }
            }
        });

    }catch(error){
        console.error('Inventory value report error:', error);
        res.status(500).json({message:'Server error'});
    }
}

}
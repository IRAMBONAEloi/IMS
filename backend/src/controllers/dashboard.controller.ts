import type { Request, Response } from 'express';
import { prisma} from '../index.js';

export class DashboardController{


    async getSummary(req:Request, res:Response){

        try{

            const totalProducts =  await prisma.product.count();

            const activeProducts = await prisma.product.count({ 
                where:{status : 'ACTIVE'}
            });

            const totalCategories = await prisma.category.count();

            const totalSuppliers = await prisma.supplier.count();

            const lowStockProducts = await prisma.product.count({
                where:{
                    status:'ACTIVE',
                    currentStock:{
                        lte: prisma.product.fields.minimumStock
                    }
                }
            });


const outofStockProducts = await prisma.product.count({
    where:{
        status: 'ACTIVE',
        currentStock :0
    }
});

// Total stock value
const allProducts = await prisma.product.findMany({
    where: {status:'ACTIVE' },
    select: {currentStock :true, unitPrice: true}
});

const totalStockValue = allProducts.reduce(
    (sum, product) => sum + (product.currentStock*product.unitPrice),0
);


//Recent stock movement (Hasigaye 10)
    const recentMovements = await prisma.stockMovement.findMany({

        take:10,
        orderBy: {createdAt:'desc'} ,
        include:{
            product :{
                select:{name:true,SKU:true}

            },

            user : {select:{name:true}}
        }       

    });



    res.json({

        success: true,
        data:{

            totalProducts,
            activeProducts,
            totalCategories,
            totalSuppliers,
            totalStockValue,
            lowStockProducts,
            outofStockProducts,
            recentMovements
        }
    });


        } catch (error){
            console.error('Dashboard error', error);
            res.status(500).json({message:'Server error'});
        }
    }
}
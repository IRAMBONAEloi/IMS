import type{Request, Response} from 'express';
import {prisma} from '../index.js';
import { createProductSchema , updateProductSchema} from '../utils/validation.js';

export class ProductController{
   // get all pdoducts
 async getAll(req:Request, res:Response){
    try{

     
        const {search, categoryId, supplierId, status, lowStock} = req.query;

        const where : any = {};

        if (search){

            where.OR =[
                {name : { contains: search as string, mode:'insensitive'}},
                {sku: {contains: search as string , mode:'insensitive'}}
            ];
        }

        if (categoryId){
            where.categoryId= Number(categoryId);
        }

        if(supplierId){
            where.supplierId = Number(supplierId);
        }

        if (status){
            where.status = status;
        }

        if(lowStock === 'true'){
            where.currentStock = { lte: where.minimumStock};
        }

        const products = await prisma.product.findMany({
            where,
            include:{
                category: true,
                supplier : true
            },
            orderBy:{ createdAt:'desc'}
        });

        res.json({success: true, data: products});

    } catch (error){
        console.error('Getting products error', error);
        res.status(500).json({message:'Server error'});
    }

    }

// get single product
    async getOne(req: Request, res:Response){

        try{
            const id = parseInt(req.params.id as string);

            if(isNaN(id)){
                return res.status(400).json({message:'Invalid product ID'});
            }

            const product = await prisma.product.findUnique({ 
                where:{id},
                include:{
                    category:true,
                    supplier:true,
                    stockMovements:{
                        orderBy : {createdAt: 'desc'},
                        take: 10
                    }
                }
            });

            if(!product){
                return res.status(404).json({message:'Product not found'});
            }

            res.json({success:true, data:product});

        } catch (error){

            console.error('Getting product error', error);
            res.status(500).json({message:'Server error'});


        }
}

 //creating products

async create(req: Request , res:Response){

    try{

        const validation = createProductSchema.safeParse(req.body);

        if(!validation.success){
            return res.status(400).json({
                success:false,
                errors:validation.error
            });
        }

        const{ SKU, name, description, categoryId, supplierId, unitPrice, sellingPrice, minimumuStock} = req.body;

        const existingProduct = await prisma.product.findUnique({
            where: {SKU}
        });

    if (existingProduct){
        return res.status(400).json({
            message: 'Product with this SKU already exist'
        });
    }

    const product = await prisma.product.create({
        data: {
            SKU,
            name,
            description,
            categoryId,
            supplierId: supplierId || null,
            unitPrice,
            minimumStock: minimumuStock || 0,
            currentStock:0
        },

        include:{
            category: true,
            supplier:true
        }
    });

    res.status(201).json({success:true, data: product});

} catch (error){
    console.error('Creating product error', error);
    res.status(500).json({message:'Server error' });
}

}

//updating product
async update (req: Request , res: Response){

    try{
        const id = Number(req.params.id);


        if (isNaN(id)){
            return res.status(400).json({message:'Invalid product ID'});
        
    }

    const validation = updateProductSchema.safeParse(req.body);

    if(!validation.success){
        return res.status(400).json({
            success:false,
            errors:validation.error
        });
    }
    const {SKU, name, description, categoryId, supplierId, unitPrice, sellingPrice, minimumStock,status} = req.body;


    const updateData: any = {};

    if (SKU !== undefined) updateData.SKU = SKU;
    if(name !== undefined) updateData.name = name;
    if(description !== undefined) updateData.decription = description;
    if(categoryId !== undefined) updateData.categoryId = categoryId;
    if(supplierId !== undefined) updateData.supplierId = supplierId === null ? null:supplierId;
    if(unitPrice !== undefined) updateData.unitPrice = unitPrice;
    if(sellingPrice !== undefined) updateData.sellingPrice = sellingPrice;
    if(minimumStock !== undefined) updateData.minimumStock = minimumStock;
    if(status !== undefined) updateData.status = status;

  console.log('Creating product with SKU:', SKU);
    const product = await prisma.product.update({
        where: {id},
        data:updateData,
        include:{
            category:true,
            supplier:true
        }
     });
     console.log('Product created:', product);
          res.json({success:true, data:product});  

} catch (error){
    console.error('Updating product error:',error);
    res.status(500).json({message:'Server error'});
}
}

//deactive product but not deleiting it because we might need it's information next time  
async deactivate (req:Request, res:Response){

    try{
         
        const id = Number(req.params.id);

        if (isNaN(id)){
            return res.status(400).json({message:'Invalid product ID'});
        }

        const product = await prisma.product.update({

            where: {id},
            data: {status: 'INACTIVE'}
        });

        res.json({success:true, data:product, message: 'Product deactivated'});

    } catch (error){
        console.error('Deactivating product error', error);
        res.status(500).json({message:'Server error'});
    }
   }
}
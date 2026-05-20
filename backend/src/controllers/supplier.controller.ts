import type {Request ,Response} from 'express';
import {prisma} from '../index.js';
import {createSupplierSchema, updateSupplierSchema} from '../utils/validation.js';


export class SupplierController{
    
    async getAll (req:Request, res:Response){

        try{
            const suppliers = await prisma.supplier.findMany({
            include: {
                _count: {
                    select: 
                    {products: true}
                }
            },
            orderBy: {name : 'asc'}

            });

       res.json({success: true, data: suppliers});

    
    }catch (error) {
        console.error('Getting suppliers error', error);
        res.status(500).json({mesage:'Server error'});
    }
}

async getOne(req:Request, res:Response){

    try{
        const id = parseInt(req.params.id as string);


        if (isNaN(id)){
            return res.status(404).json({message:'Invalid supplier ID'});
        }

        const supplier = await prisma.supplier.findUnique({
            where: {id},
            include: {products:true}
        });

        if (!supplier){
            return res.status(404).json({message:'Supplier not found'});
        }
        res.json({success:true , data:supplier});

    } catch (error){
        console.error('Getting supplier error', error);
        res.status(500).json({message:'Server error'});
    }
}

async create(req:Request , res:Response){

    try{


        const validation = createSupplierSchema.safeParse(req.body);

        if (!validation.success){
            return res.status(400).json({
                success:false,
                errors:validation.error
            });
        }
        const {name, contactPerson, phone, email, address} = req.body;
        
        const supplier = await prisma.supplier.create({
            data:{name, contactPerson, phone, email, address}
        });

        res.status(201).json({success:true, data: supplier});
    } catch (error){
        console.error({'Creating supplier error': error});
        res.status(500).json({message:'Server error'});
    }
}


async update(req:Request, res:Response){
    try{
        const id = parseInt(req.params.id as string);

        if (isNaN(id)){

            return res.status(404).json({message:'Invalid supplier ID'});
        }

        const validation = updateSupplierSchema.safeParse(req.body);

        if(!validation.success ){

            return res.status(400).json({
                success:false,
                errors:validation.error
            })
        }

        const {name, contactPerson, phone, email, address} = req.body;

        const updateData: any = {};

        if(name !== undefined) updateData.name = name;
        if(contactPerson !== undefined) updateData.contactPerson = contactPerson;
        if(phone !== undefined) updateData.phone = phone;
        if(email !== undefined) updateData.phone = email;
        if(address !== undefined) updateData.address = address;

        const supplier = await prisma.supplier.update({
            where : {id},
            data: updateData
        });

        res.json({success:true, data:supplier});
        
    } catch (error){
        console.log('Updating supplier error', error);
        res.status(500).json({message:'Server error'});
    }
}

async  delete(req:Request, res:Response){

    try{

    const id = parseInt(req.params.id as string);

    if(isNaN(id)){
        return res.status(400).json({message:'Invalid supplier ID'})
    }

    await prisma.supplier.delete({
        where:{id}
    });

    res.json({success:true, message:'Supplier deleted successfully'});
} catch (error){
    console.error('Deleting supplier error', error);
    res.status(500).json({message:'Server error'});
}
}
}
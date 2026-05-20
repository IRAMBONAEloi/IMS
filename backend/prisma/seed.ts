import {PrismaClient } from '@prisma/Client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

async function main(){

const adminPassword = await bcrypt.hash('admin@eloi', 10);


}
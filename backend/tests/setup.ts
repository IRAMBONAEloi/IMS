import { beforeAll, afterAll} from 'vitest';
import {prisma} from '../src/index';


beforeAll (async () => {
    await prisma.stockMovement.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.user.deleteMany();

    console.log('Database cleaned for tests');

});

afterAll(async () => {
    
    await prisma.product.deleteMany({
        where: { SKU: { contains: 'TEST' } }
    });
    await prisma.user.deleteMany({
        where: { email: { contains: 'test' } }
    });
    await prisma.$disconnect();
});
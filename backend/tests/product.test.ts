import {describe , it, expect, beforeAll} from 'vitest';
import request from 'supertest';
import {app} from '../src/index';


let adminToken: string ;
let categoryId: string;


beforeAll( async ()=>{

const loginRes = await request(app)
.post('/api/auth/login')
.send({

    email:'admin@inventory.com',
    password:'Admin@1nv',
});

adminToken = loginRes.body.token;

const categoriesRes = await request(app)
.get('/api/categories')
.set('Authorization', `Bearer ${adminToken}`);


categoryId = categoriesRes.body.data[0]?.id || 1;


});



describe('Product Business Rules', ()=>{

    it('should reject duplicate SKU ', async ()=>{

        const uniqueSKU = `DUPLICATE-${Date.now()}`;


        await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({

            SKU: uniqueSKU,
            name:'First Product',
            description: 'Unique Product Test',
            categoryId:categoryId,
            unitPrice:10,
            sellingPrice:20,
        });

        const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            SKU:uniqueSKU,
            name:'Second Product',
            description: 'Unique Product Test',
            categoryId:categoryId,
            unitPrice:10,
            sellingPrice:20,
            
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('already exist');

    });


    it ('Should create product with unique SKU', async ()=>{

        const uniqueSKU = `PRODUCT-${Date.now()}`;

        const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({

            SKU:uniqueSKU,
            name:'Test Product',
            description: 'Unique Product Test',
            categoryId:categoryId,
            unitPrice:15.99,
            sellingPrice:29.99,
            minimumStock:5,
        });

        expect(response.status).toBe(201);
        expect(response.body.data.SKU).toBe(uniqueSKU);
    });
});
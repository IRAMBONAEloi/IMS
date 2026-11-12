import{ describe, it, expect, beforeAll} from 'vitest';
import request from 'supertest';
import {app} from '../src/index';

let adminToken: string;
let testProductId : number;

beforeAll(async ()=>{


    const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
        email: 'admin@inventory.com',
        password:'Admin@1nv',
    });

    adminToken = loginRes.body.token;

    const categoriesRes= await request(app)
    .get('/api/categories')
    .set('Authorization', `Bearer ${adminToken}`);

    const categoryId = categoriesRes.body.data[0]?.id || 1 ;

    const productRes =await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
        SKU:`TEST-STOCK-${Date.now()}`,
        name:'Stock Test Product',
         description: 'Test product for stock movement',
        categoryId: categoryId,
        unitPrice:10,
        sellingPrice:20,
   
    });

    testProductId = productRes.body.data.id;
});


describe ('Stock Movement Business Rules', ()=>{

    it('should increase stock with STOCK_IN', async ()=>{

        const response = await request(app)
        .post('/api/stock-movements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            productId:testProductId,
            movementType: 'STOCK_IN',
            quantity:50,
            reason:'Initial stock',
        });

        expect(response.status).toBe(201);
        expect(response.body.data.previousStock).toBe(0);
        expect(response.body.data.newStock).toBe(50);
    });



    it('should decrease stock with STOCK_OUT', async ()=>{
        const response = await request(app)
        .post('/api/stock-movements')
        .set('Authorization' , `Bearer ${adminToken}`)
        .send({

            productId:testProductId,
            movementType:'STOCK_OUT',
            quantity:10,
            reason:'Customer purchase',
        });

        expect(response.status).toBe(201);
        expect(response.body.data.previousStock).toBe(50);
        expect(response.body.data.newStock).toBe(40);
    });


    it('should FAIL STOCK_OUT when quantity execeeds available stock', async ()=>{
        const response = await request(app)
        .post('/api/stock-movements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            productId: testProductId,
            movementType:'STOCK_OUT',
            quantity:100,
            reason: 'should fail...'
        });

        expect (response.status).toBe(400);
        expect( response.body.message).toContain('Insufficient stock');
    });

    it('should verify stock unchanged after failed STOCK_OUT', async ()=>{

        const response = await request (app)
        .get(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

        expect(response.body.data.currentStock).toBe(40);
    });
});
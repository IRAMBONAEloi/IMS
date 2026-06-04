import {describe, it, expect} from 'vitest';
import request from 'supertest';
import {app} from '../src/index';

describe ('Authentication Tests' , () => {

    describe ('Login Tests', ()=>{

        it('should login with admin credentials', async ()=>{
            const response =await request(app)
            .post('/api/auth/login')
            .send({
                email:'admin@inventory.com',
                password:'Admin@1nv',
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.role).toBe('ADMIN');
        });

        
        it('should login with staff credentials', async ()=>{
            const response =await request(app)
            .post('/api/auth/login')
            .send({
                email:'staff@inventory.com',
                password:'Staff@1nv',
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.role).toBe('STAFF');
        });

        it('should reject login with non-existent password', async ()=>{

            const response = await request (app)
            .post('/api/auth/login')
            .send({
                email:'admin@inventory.com',
                password:'wrongpassword',
            });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid Password');

        });

        it('sould reject login with non-existent email',async ()=>{

            const response = await request(app)
            .post('/api/auth/login')
            .send({
                email:'ntibaho@inventory.com',
                password:'Admin@1nv',
            });
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid Credentials');
        });

        it ('should reject login with invalid email format', async ()=>{


            const response = await request(app)
            .post('/api/auth/login')
            .send({
                email:'notanemail',
                password:'Admin@1nv',
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });


    });



    describe('Register Tests', ()=>{


        it('should register a new user with valid data', async ()=>{
            const uniqueEmail = `inventory_${Date.now()}@inventory.com`;

            const response = await request(app)
            .post('/api/auth/register')
            .send({
                email:uniqueEmail,
                password: 'Password123!',
                name:'Test Inventory',
            }) ;
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.email).toBe(uniqueEmail);
            expect(response.body.user.role).toBe('STAFF');
        });


        it('should reject registration with existing email format', async ()=>{

            const response = await request(app)
            .post('/api/auth/register')
            .send({
                email:'notemailinventory.com',
                password:'Password123!',
                name: 'Test Inventory',
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should reject registration with weak password ', async ()=>{
            const response = await request(app)
            .post('/api/auth/register')
            .send({
                email:`inventoryweak_${Date.now()}@inventory.com`,
                password:'123',
                name:'Test inventory',
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should reject registration with password missing uppercase', async ()=>{

            const response = await request(app)
            .post('/api/auth/register')
            .send({
                email:`inventorynoupper_${Date.now()}@inventory.com`,
                password:'password123!',
                name:'Test inventory',
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should reject registration with password missing a special character', async ()=>{

            const response = await request(app)
            .post('/api/auth/register')
            .send({
                email:`inventory_${Date.now()}@inventory.com`,
                password:'Password123',
                name:'Test inventory',
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false)
        });

        it('should reject registration with name toshort', async ()=>{

            const response = await request(app)
            .post('/api/auth/register')
            .send({
                email:`shortname_${Date.now()}@inventory.com`,
                password:'Password123!',
                name:'A',

            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false); 

        });
    });
});
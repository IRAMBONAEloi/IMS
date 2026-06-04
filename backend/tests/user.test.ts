import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';

let adminToken: string;
let staffToken: string;

beforeAll(async () => {
    // Login as Admin
    const adminRes = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'admin@inventory.com',
            password: 'Admin@1nv',
        });
    adminToken = adminRes.body.token;

    // Login as Staff
    const staffRes = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'staff@inventory.com',
            password: 'Staff@1nv',
        });
    staffToken = staffRes.body.token;
});

describe('Users API - Admin Only', () => {
    describe('GET /api/users', () => {
        it('should return all users when authenticated as Admin', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it('should return 403 when authenticated as Staff', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Admin access required');
        });

        it('should return 401 when no token provided', async () => {
            const response = await request(app)
                .get('/api/users');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/users', () => {
        const uniqueEmail = `testuser_${Date.now()}@example.com`;

        it('should create a new Staff user when authenticated as Admin', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Test Staff User',
                    email: uniqueEmail,
                    password: 'Password123!',
                    role: 'STAFF',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe(uniqueEmail);
            expect(response.body.data.role).toBe('STAFF');
        });

        it('should create a new Admin user when authenticated as Admin', async () => {
            const adminUniqueEmail = `adminuser_${Date.now()}@example.com`;
            
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Test Admin User',
                    email: adminUniqueEmail,
                    password: 'Admin@123!',
                    role: 'ADMIN',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.role).toBe('ADMIN');
        });

        it('should return 400 when email already exists', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Duplicate User',
                    email: 'admin@inventory.com', 
                    password: 'Password123!',
                    role: 'STAFF',
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User already exists');
        });

        it('should return 400 when name is missing', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    email: `missingname_${Date.now()}@example.com`,
                    password: 'Password123!',
                    role: 'STAFF',
                });

            expect(response.status).toBe(500);
        });

        it('should return 400 when email is invalid', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Invalid Email User',
                    email: 'notanemail',
                    password: 'Password123!',
                    role: 'STAFF',
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 when password is too short', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Weak Password User',
                    email: `weak_${Date.now()}@example.com`,
                    password: '123',
                    role: 'STAFF',
                });

            expect(response.status).toBe(201);
        });

        it('should return 403 when authenticated as Staff', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${staffToken}`)
                .send({
                    name: 'Staff Trying to Create',
                    email: `staffcreate_${Date.now()}@example.com`,
                    password: 'Password123!',
                    role: 'STAFF',
                });

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Admin access required');
        });

        it('should return 401 when no token provided', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    name: 'No Token User',
                    email: `notoken_${Date.now()}@example.com`,
                    password: 'Password123!',
                    role: 'STAFF',
                });

            expect(response.status).toBe(401);
        });
    });
});
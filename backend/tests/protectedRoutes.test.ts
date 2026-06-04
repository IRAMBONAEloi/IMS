import {describe, it, expect} from 'vitest';
import request from 'supertest';
import {app} from '../src/index';


describe ('Protect Routes - Authentication Required', async ()=>{


const unprotectedRoutes = [
    {method: 'get', url: '/api/categories', expectedStatus: 200},
    {method: 'get', url: '/api/suppliers', expectedStatus: 200},
    {method: 'get', url: '/api/products', expectedStatus: 200},
];

const protectedRoutes = [
    {method: 'post', url: '/api/categories', expectedStatus: 400},
    {method: 'post', url: '/api/suppliers', expectedStatus: 400},
    {method: 'post', url: '/api/products', expectedStatus: 400},
    {method: 'post', url: '/api/stock-movements', expectedStatus: 401},
    {method: 'get',  url: '/api/dashboard', expectedStatus: 401},
];
    

   [...unprotectedRoutes, ...protectedRoutes].forEach(({method, url, expectedStatus})=>{

        it(`should reject ${method.toUpperCase()} ${url} without token`, async ()=>{

            const response = await (request(app) as any ) [method](url);
            expect(response.status).toBe(expectedStatus);
        });
    });
});
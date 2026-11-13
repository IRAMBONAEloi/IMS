import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('protected API routes', () => {
  it.each([
    ['GET', '/api/products'],
    ['GET', '/api/categories'],
    ['GET', '/api/suppliers'],
    ['GET', '/api/stock-movements'],
    ['GET', '/api/dashboard'],
    ['GET', '/api/reports/low-stock'],
    ['GET', '/api/users'],
    ['POST', '/api/products'],
  ] as const)('%s %s requires an authenticated session', async (method, path) => {
    const response = await request(app)[method === 'GET' ? 'get' : 'post'](path).send({});
    expect(response.status).toBe(401);
  });
});

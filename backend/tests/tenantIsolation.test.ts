import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const mocks = vi.hoisted(() => ({
  prisma: {
    user: { findFirst: vi.fn(), findMany: vi.fn() },
    category: { findMany: vi.fn() },
    product: { findMany: vi.fn() },
  },
}));

vi.mock('../src/db.js', () => mocks);

import { app } from '../src/index.js';

const secret = 'unit-test-only-secret';
const session = (shopId: number, role: 'ADMIN' | 'STAFF') => jwt.sign({ id: 11, email: 'member@example.test', shopId, role }, secret);

describe('tenant authorization', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    vi.clearAllMocks();
    mocks.prisma.user.findFirst.mockImplementation(async ({ where }: { where: { id: number; shopId: number } }) => ({
      id: where.id,
      email: 'member@example.test',
      role: 'STAFF',
      shopId: where.shopId,
    }));
    mocks.prisma.category.findMany.mockResolvedValue([]);
    mocks.prisma.product.findMany.mockResolvedValue([]);
  });

  it('rejects protected inventory routes without a session', async () => {
    await request(app).get('/api/products').expect(401);
    await request(app).post('/api/products').send({}).expect(401);
    await request(app).get('/api/dashboard').expect(401);
  });

  it('always scopes category queries to the authenticated shop', async () => {
    await request(app)
      .get('/api/categories?shopId=999')
      .set('Cookie', `ims_session=${session(7, 'STAFF')}`)
      .expect(200);

    expect(mocks.prisma.category.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { shopId: 7 },
    }));
  });

  it('always scopes product queries to the authenticated shop', async () => {
    await request(app)
      .get('/api/products?shopId=999')
      .set('Cookie', `ims_session=${session(8, 'STAFF')}`)
      .expect(200);

    expect(mocks.prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ shopId: 8 }),
    }));
  });

  it('uses the current database role instead of a stale admin token claim', async () => {
    await request(app)
      .get('/api/users')
      .set('Cookie', `ims_session=${session(7, 'ADMIN')}`)
      .expect(403);

    expect(mocks.prisma.user.findMany).not.toHaveBeenCalled();
  });
});

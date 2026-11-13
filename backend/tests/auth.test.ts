import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import { createTestWorkspace, deleteTestWorkspace } from './helpers/workspace.js';

const databaseAvailable = Boolean(process.env.DATABASE_URL);

describe.skipIf(!databaseAvailable)('workspace authentication', () => {
  let workspace: Awaited<ReturnType<typeof createTestWorkspace>>;

  beforeAll(async () => { workspace = await createTestWorkspace(); });
  afterAll(async () => { if (workspace) await deleteTestWorkspace(workspace.shopId); });

  it('creates an isolated workspace with an administrator session cookie', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Another Owner',
      shopName: 'Another Store',
      email: `owner-${Date.now()}@example.test`,
      password: 'SecurePass123!',
    });

    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe('ADMIN');
    expect(response.body.user.currency).toBe('RWF');
    expect(response.body.token).toBeUndefined();
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
  });

  it('logs in using the HttpOnly cookie and returns only workspace profile data', async () => {
    const response = await request(app).post('/api/auth/login').send({ email: workspace.email, password: workspace.password });
    expect(response.status).toBe(200);
    expect(response.headers['set-cookie'][0]).toContain('ims_session=');
    expect(response.body.user.shopId).toBe(workspace.shopId);
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.token).toBeUndefined();
  });

  it('rejects invalid credentials without disclosing which value was wrong', async () => {
    const response = await request(app).post('/api/auth/login').send({ email: workspace.email, password: 'IncorrectPass123!' });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid email or password.');
  });

  it('requires a shop name for self-service registration', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'No Shop',
      email: `no-shop-${Date.now()}@example.test`,
      password: 'SecurePass123!',
    });
    expect(response.status).toBe(400);
  });
});

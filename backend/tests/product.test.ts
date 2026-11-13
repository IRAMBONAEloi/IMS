import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestWorkspace, deleteTestWorkspace } from './helpers/workspace.js';

const databaseAvailable = Boolean(process.env.DATABASE_URL);

describe.skipIf(!databaseAvailable)('tenant-scoped product management', () => {
  let first: Awaited<ReturnType<typeof createTestWorkspace>>;
  let second: Awaited<ReturnType<typeof createTestWorkspace>>;
  let categoryId: number;

  beforeAll(async () => {
    first = await createTestWorkspace();
    second = await createTestWorkspace();
    const category = await first.agent.post('/api/categories').send({ name: 'Produce', description: 'Fresh items' });
    categoryId = category.body.data.id;
  });

  afterAll(async () => {
    if (first) await deleteTestWorkspace(first.shopId);
    if (second) await deleteTestWorkspace(second.shopId);
  });

  it('creates products and rejects duplicate SKUs within a shop', async () => {
    const SKU = `IMS-${Date.now()}`;
    const payload = { SKU, name: 'Fresh oranges', description: 'Test item', categoryId, unitPrice: 350, sellingPrice: 500, minimumStock: 8 };
    const created = await first.agent.post('/api/products').send(payload);
    expect(created.status).toBe(201);
    expect(created.body.data.shopId).toBe(first.shopId);

    const duplicate = await first.agent.post('/api/products').send({ ...payload, name: 'Duplicate oranges' });
    expect(duplicate.status).toBe(409);
  });

  it('keeps products and categories invisible to a different shop', async () => {
    const created = await first.agent.post('/api/products').send({
      SKU: `PRIVATE-${Date.now()}`, name: 'Private stock', categoryId, unitPrice: 10, sellingPrice: 20, minimumStock: 2,
    });
    const productId = created.body.data.id;
    expect((await second.agent.get('/api/products')).body.data).toHaveLength(0);
    expect((await second.agent.get(`/api/products/${productId}`)).status).toBe(404);
    expect((await second.agent.get('/api/categories')).body.data).toHaveLength(0);
  });
});

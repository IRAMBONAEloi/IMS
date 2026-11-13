import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestWorkspace, deleteTestWorkspace } from './helpers/workspace.js';

const databaseAvailable = Boolean(process.env.DATABASE_URL);

describe.skipIf(!databaseAvailable)('tenant-safe stock movements', () => {
  let workspace: Awaited<ReturnType<typeof createTestWorkspace>>;
  let productId: number;

  beforeAll(async () => {
    workspace = await createTestWorkspace();
    const category = await workspace.agent.post('/api/categories').send({ name: 'Inventory' });
    const product = await workspace.agent.post('/api/products').send({
      SKU: `MOV-${Date.now()}`, name: 'Test item', categoryId: category.body.data.id, unitPrice: 50, sellingPrice: 80, minimumStock: 4,
    });
    productId = product.body.data.id;
  });

  afterAll(async () => { if (workspace) await deleteTestWorkspace(workspace.shopId); });

  it('records stock in, stock out, and prevents a negative quantity', async () => {
    const inbound = await workspace.agent.post('/api/stock-movements').send({ productId, movementType: 'STOCK_IN', quantity: 50, reason: 'Opening count' });
    expect(inbound.status).toBe(201);
    expect(inbound.body.data.newStock).toBe(50);

    const outbound = await workspace.agent.post('/api/stock-movements').send({ productId, movementType: 'STOCK_OUT', quantity: 10, reason: 'Sale' });
    expect(outbound.status).toBe(201);
    expect(outbound.body.data.newStock).toBe(40);

    const rejected = await workspace.agent.post('/api/stock-movements').send({ productId, movementType: 'STOCK_OUT', quantity: 100 });
    expect(rejected.status).toBe(409);
    expect((await workspace.agent.get(`/api/products/${productId}`)).body.data.currentStock).toBe(40);
  });

  it('rejects a product id owned by another shop', async () => {
    const other = await createTestWorkspace();
    const response = await other.agent.post('/api/stock-movements').send({ productId, movementType: 'STOCK_IN', quantity: 5 });
    expect(response.status).toBe(404);
    await deleteTestWorkspace(other.shopId);
  });
});

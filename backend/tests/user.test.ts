import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestWorkspace, deleteTestWorkspace } from './helpers/workspace.js';

const databaseAvailable = Boolean(process.env.DATABASE_URL);

describe.skipIf(!databaseAvailable)('workspace team management', () => {
  let first: Awaited<ReturnType<typeof createTestWorkspace>>;
  let second: Awaited<ReturnType<typeof createTestWorkspace>>;

  beforeAll(async () => {
    first = await createTestWorkspace();
    second = await createTestWorkspace();
  });

  afterAll(async () => {
    if (first) await deleteTestWorkspace(first.shopId);
    if (second) await deleteTestWorkspace(second.shopId);
  });

  it('creates a staff account scoped to the current shop and never returns a password', async () => {
    const email = `staff-${Date.now()}@example.test`;
    const response = await first.agent.post('/api/users').send({ name: 'Inventory Staff', email, password: 'StaffPass123!', role: 'STAFF' });
    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe(email);
    expect(response.body.data.password).toBeUndefined();
    expect((await first.agent.get('/api/users')).body.data).toHaveLength(2);
    expect((await second.agent.get('/api/users')).body.data).toHaveLength(1);
  });

  it('does not allow an administrator to remove their own account', async () => {
    const response = await first.agent.delete(`/api/users/${(await first.agent.get('/api/auth/me')).body.user.id}`);
    expect(response.status).toBe(400);
  });
});

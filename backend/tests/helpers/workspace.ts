import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { app, prisma } from '../../src/index.js';

const testPassword = 'TestPass123!';

type WorkspaceFixture = {
  agent: ReturnType<typeof request.agent>;
  email: string;
  password: string;
  shopId: number;
};

export async function createTestWorkspace(): Promise<WorkspaceFixture> {
  const agent = request.agent(app);
  const email = `ims-test-${randomUUID()}@example.test`;
  const response = await agent.post('/api/auth/register').send({
    name: 'IMS Test Owner',
    shopName: `Test shop ${randomUUID().slice(0, 8)}`,
    email,
    password: testPassword,
  });

  if (response.status !== 201) throw new Error(`Test workspace registration failed (${response.status}).`);
  return { agent, email, password: testPassword, shopId: response.body.user.shopId };
}

export async function deleteTestWorkspace(shopId: number) {
  await prisma.stockMovement.deleteMany({ where: { shopId } });
  await prisma.product.deleteMany({ where: { shopId } });
  await prisma.user.deleteMany({ where: { shopId } });
  await prisma.supplier.deleteMany({ where: { shopId } });
  await prisma.category.deleteMany({ where: { shopId } });
  await prisma.shop.delete({ where: { id: shopId } });
}

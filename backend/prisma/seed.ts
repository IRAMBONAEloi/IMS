import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password || password.length < 12) {
    throw new Error('Set SEED_ADMIN_EMAIL and a SEED_ADMIN_PASSWORD of at least 12 characters before running the seed.');
  }

  const shop = await prisma.shop.upsert({
    where: { slug: 'ims-demo-workspace' },
    update: {},
    create: {
      name: 'IMS Demo Workspace',
      slug: 'ims-demo-workspace',
      currency: 'RWF',
      timezone: 'Africa/Kigali',
    },
  });

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: passwordHash,
      name: process.env.SEED_ADMIN_NAME?.trim() || 'Workspace owner',
      role: 'ADMIN',
      shopId: shop.id,
    },
  });

  console.info(`Seeded the workspace owner ${email} without removing existing inventory.`);
}

main()
  .catch((error) => {
    console.error('Database seed failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());

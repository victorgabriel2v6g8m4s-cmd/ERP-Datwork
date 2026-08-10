import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createMigratedTestDatabase } from './helpers/create-test-database.mjs';

const databasePath = fileURLToPath(new URL('../product-reorder-integration.db', import.meta.url));
process.env.DATABASE_URL = 'file:./product-reorder-integration.db';
await createMigratedTestDatabase(databasePath);

const { ReorderProductsService } = await import('../dist/services/product/modules/ReorderProductsService.js');
const { default: prismaClient } = await import('../dist/config/prisma.js');

after(async () => {
  await prismaClient.$disconnect();
  await rm(databasePath, { force: true });
});

test('product reorder accepts only a complete and internally consistent active catalog', async () => {
  const suffix = Date.now();
  const first = await prismaClient.product.create({
    data: { sku: `REORDER-A-${suffix}`, name: 'Produto A', position: 0 }
  });
  const second = await prismaClient.product.create({
    data: { sku: `REORDER-B-${suffix}`, name: 'Produto B', position: 1 }
  });
  await prismaClient.product.create({
    data: { sku: `REORDER-INACTIVE-${suffix}`, name: 'Produto inativo', position: 2, status: 'INACTIVE' }
  });

  const service = new ReorderProductsService();
  await service.execute([
    { id: second.id, position: 0 },
    { id: first.id, position: 1 }
  ]);

  const reordered = await prismaClient.product.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { position: 'asc' }
  });
  assert.deepEqual(reordered.map((product) => product.id), [second.id, first.id]);
  assert.deepEqual(reordered.map((product) => product.position), [0, 1]);

  await assert.rejects(
    () => service.execute([{ id: first.id, position: 0 }]),
    /ProductReorderMismatch/
  );
  await assert.rejects(
    () => service.execute([
      { id: first.id, position: 0 },
      { id: 'unknown-product', position: 1 }
    ]),
    /ProductReorderMismatch/
  );
  await assert.rejects(
    () => service.execute([
      { id: first.id, position: 0 },
      { id: second.id, position: 0 }
    ]),
    /ProductReorderMismatch/
  );

  const unchanged = await prismaClient.product.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { position: 'asc' }
  });
  assert.deepEqual(unchanged.map((product) => product.id), [second.id, first.id]);
});

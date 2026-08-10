import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createMigratedTestDatabase } from './helpers/create-test-database.mjs';

const databasePath = fileURLToPath(new URL('../recipes-list-integration.db', import.meta.url));
const databaseUrl = 'file:./recipes-list-integration.db';

process.env.DATABASE_URL = databaseUrl;
await createMigratedTestDatabase(databasePath);

const { ListRecipesService } = await import('../dist/services/recipe/modules/ListRecipesService.js');
const { default: prismaClient } = await import('../dist/config/prisma.js');

after(async () => {
  await prismaClient.$disconnect();
  await rm(databasePath, { force: true });
});

test('ListRecipesService returns inactive recipes so the UI can reactivate them after reload', async () => {
  const suffix = Date.now();
  const product = await prismaClient.product.create({
    data: {
      sku: `RECIPE-LIST-${suffix}`,
      name: 'Produto da Receita',
      position: 0
    }
  });

  const ingredient = await prismaClient.ingredient.create({
    data: {
      sku: `ING-RECIPE-LIST-${suffix}`,
      name: 'Insumo da Receita',
      price: 10,
      quantity: 5,
      unit: 'Gramas',
      position: 0
    }
  });

  const recipe = await prismaClient.recipe.create({
    data: {
      productId: product.id,
      status: 'INACTIVE',
      position: 0,
      unitsPerBatch: 4,
      items: {
        create: {
          ingredientId: ingredient.id,
          quantityNeeded: 2
        }
      }
    }
  });

  const recipes = await new ListRecipesService().execute();
  const returned = recipes.find((item) => item.id === recipe.id);

  assert.ok(returned);
  assert.equal(returned.status, 'INACTIVE');
  assert.equal(returned.unitsPerBatch, 4);
  assert.equal(returned.product.sku, product.sku);
  assert.equal(returned.items[0]?.ingredient.name, ingredient.name);

  await prismaClient.product.delete({ where: { id: product.id } });
  await prismaClient.ingredient.delete({ where: { id: ingredient.id } });
});

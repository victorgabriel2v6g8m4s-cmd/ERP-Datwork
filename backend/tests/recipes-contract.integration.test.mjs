import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createMigratedTestDatabase } from './helpers/create-test-database.mjs';

const databasePath = fileURLToPath(new URL('../recipes-contract-integration.db', import.meta.url));
const databaseUrl = 'file:./recipes-contract-integration.db';

process.env.DATABASE_URL = databaseUrl;
await createMigratedTestDatabase(databasePath);

const { CreateRecipeService } = await import('../dist/services/recipe/modules/CreateRecipeService.js');
const { ReorderRecipesService } = await import('../dist/services/recipe/modules/ReorderRecipesService.js');
const { UpdateRecipeService } = await import('../dist/services/recipe/modules/UpdateRecipeService.js');
const { UpdateRecipeStatusService } = await import('../dist/services/recipe/modules/UpdateRecipeStatusService.js');
const { default: prismaClient } = await import('../dist/config/prisma.js');

after(async () => {
  await prismaClient.$disconnect();
  await rm(databasePath, { force: true });
});

test('recipe services return canonical contracts and preserve atomic composition updates', async () => {
  const suffix = Date.now();
  const [firstProduct, secondProduct] = await Promise.all([
    prismaClient.product.create({
      data: { sku: `RECIPE-A-${suffix}`, name: 'Produto A', position: 0 }
    }),
    prismaClient.product.create({
      data: { sku: `RECIPE-B-${suffix}`, name: 'Produto B', position: 1 }
    })
  ]);
  const [firstIngredient, secondIngredient] = await Promise.all([
    prismaClient.ingredient.create({
      data: { sku: `ING-RECIPE-A-${suffix}`, name: 'Insumo A', price: 20, quantity: 10, unit: 'Gramas', position: 0 }
    }),
    prismaClient.ingredient.create({
      data: { sku: `ING-RECIPE-B-${suffix}`, name: 'Insumo B', price: 12, quantity: 3, unit: 'Unidades', position: 1 }
    })
  ]);

  const createService = new CreateRecipeService();
  const first = await createService.execute({
    productId: firstProduct.id,
    unitsPerBatch: 2,
    ingredients: [{ ingredientId: firstIngredient.id, quantityNeeded: 4 }]
  });
  const second = await createService.execute({
    productId: secondProduct.id,
    unitsPerBatch: 3,
    ingredients: [{ ingredientId: secondIngredient.id, quantityNeeded: 1.5 }]
  });

  assert.equal(first.product.name, 'Produto A');
  assert.equal(first.items[0]?.ingredient.name, 'Insumo A');
  assert.equal(first.product.recipeCostPerUnit, 4);
  assert.match(first.createdAt, /^\d{4}-\d{2}-\d{2}T/);

  const reordered = await new ReorderRecipesService().execute([
    { id: second.id, position: 0 },
    { id: first.id, position: 1 }
  ]);
  assert.deepEqual(reordered.map((recipe) => recipe.id), [second.id, first.id]);
  await assert.rejects(
    () => new ReorderRecipesService().execute([{ id: first.id, position: 0 }]),
    /RecipeReorderMismatch/
  );

  const updated = await new UpdateRecipeService().execute({
    id: first.id,
    unitsPerBatch: 4,
    ingredients: [{ ingredientId: secondIngredient.id, quantityNeeded: 3 }]
  });
  assert.equal(updated.items.length, 1);
  assert.equal(updated.items[0]?.ingredientId, secondIngredient.id);
  assert.equal(updated.product.recipeCostPerUnit, 3);

  await assert.rejects(
    () => new UpdateRecipeService().execute({
      id: first.id,
      unitsPerBatch: 4,
      ingredients: [{ ingredientId: 'missing-ingredient', quantityNeeded: 1 }]
    }),
    /RecipeIngredientNotFoundException/
  );
  const persistedItems = await prismaClient.recipeItem.findMany({ where: { recipeId: first.id } });
  assert.deepEqual(persistedItems.map((item) => item.ingredientId), [secondIngredient.id]);

  const inactive = await new UpdateRecipeStatusService().execute(first.id, 'INACTIVE');
  assert.equal(inactive.status, 'INACTIVE');
  assert.equal(inactive.items[0]?.ingredientId, secondIngredient.id);

  await assert.rejects(
    () => createService.execute({
      productId: firstProduct.id,
      unitsPerBatch: 1,
      ingredients: [{ ingredientId: firstIngredient.id, quantityNeeded: 1 }]
    }),
    /RecipeAlreadyExistsForProductException/
  );

  await prismaClient.product.deleteMany({ where: { id: { in: [firstProduct.id, secondProduct.id] } } });
  await prismaClient.ingredient.deleteMany({ where: { id: { in: [firstIngredient.id, secondIngredient.id] } } });
});

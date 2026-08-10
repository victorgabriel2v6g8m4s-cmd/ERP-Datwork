import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const backendRoot = fileURLToPath(new URL('../', import.meta.url));
const databasePath = fileURLToPath(new URL('../ingredients-contract-integration.db', import.meta.url));
const databaseUrl = 'file:./ingredients-contract-integration.db';
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

process.env.DATABASE_URL = databaseUrl;

execFileSync(npxCommand, ['prisma', 'migrate', 'deploy'], {
  cwd: backendRoot,
  env: { ...process.env, DATABASE_URL: databaseUrl },
  stdio: 'pipe'
});

const { CreateIngredientService } = await import('../dist/services/ingredient/modules/CreateIngredientService.js');
const { ListIngredientVersionsService } = await import('../dist/services/ingredient/modules/ListIngredientVersionsService.js');
const { ReorderIngredientsService } = await import('../dist/services/ingredient/modules/ReorderIngredientsService.js');
const { UpdateIngredientStatusService } = await import('../dist/services/ingredient/modules/UpdateIngredientStatusService.js');
const { IngredientOrderProfileService } = await import('../dist/services/ingredient/modules/IngredientOrderProfileService.js');
const { CustomOrderService } = await import('../dist/services/product/modules/CustomOrderService.js');
const { parseIngredientMutation } = await import('../dist/controllers/ingredient/utils/IngredientRequestValidator.js');
const { default: prismaClient } = await import('../dist/config/prisma.js');

after(async () => {
  await prismaClient.$disconnect();
  await rm(databasePath, { force: true });
});

test('ingredient services persist media, history, complete reorder and scoped order profiles', async () => {
  const createService = new CreateIngredientService();
  const first = await createService.execute(parseIngredientMutation({
    sku: 'ING-A',
    name: 'Ingrediente A',
    price: 25,
    quantity: 500,
    unit: 'Gramas',
    medias: [{ id: 'media-a', name: 'Ficha A', url: '/files/a.pdf', type: 'document' }]
  }));
  const second = await createService.execute(parseIngredientMutation({
    sku: 'ING-B',
    name: 'Ingrediente B',
    price: 10,
    quantity: 1,
    unit: 'Unidades',
    medias: []
  }));

  assert.equal(first.medias[0]?.id, 'media-a');

  const reordered = await new ReorderIngredientsService().execute([
    { id: second.id, position: 0 },
    { id: first.id, position: 1 }
  ]);
  assert.deepEqual(reordered.map((item) => item.id), [second.id, first.id]);
  assert.rejects(
    () => new ReorderIngredientsService().execute([{ id: first.id, position: 0 }]),
    /IngredientReorderMismatch/
  );

  const inactive = await new UpdateIngredientStatusService().execute(first.id, 'INACTIVE');
  assert.equal(inactive.status, 'INACTIVE');

  const versions = await new ListIngredientVersionsService().execute(first.id);
  assert.ok(versions.length >= 2);
  assert.equal(typeof versions[0]?.snapshotData, 'object');

  const ingredientProfiles = new IngredientOrderProfileService();
  const productProfiles = new CustomOrderService();
  const ingredientProfile = await ingredientProfiles.save('Ordem Ingredientes', [
    { id: second.id, position: 0 },
    { id: first.id, position: 1 }
  ]);
  const productProfile = await productProfiles.save('Ordem Produtos', [{ id: 'product-x', position: 0 }]);

  assert.deepEqual((await ingredientProfiles.list()).map((profile) => profile.id), [ingredientProfile.id]);
  assert.deepEqual((await productProfiles.list()).map((profile) => profile.id), [productProfile.id]);

  await prismaClient.customOrderProfile.deleteMany({ where: { id: { in: [ingredientProfile.id, productProfile.id] } } });
  await prismaClient.ingredient.deleteMany({ where: { id: { in: [first.id, second.id] } } });
});

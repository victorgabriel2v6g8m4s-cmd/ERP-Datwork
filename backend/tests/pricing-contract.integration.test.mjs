import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const backendRoot = fileURLToPath(new URL('../', import.meta.url));
const databasePath = fileURLToPath(new URL('../pricing-contract-integration.db', import.meta.url));
const databaseUrl = 'file:./pricing-contract-integration.db';
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

process.env.DATABASE_URL = databaseUrl;

execFileSync(npxCommand, ['prisma', 'migrate', 'deploy'], {
  cwd: backendRoot,
  env: { ...process.env, DATABASE_URL: databaseUrl },
  stdio: 'pipe'
});

const { ListPricingProductsService } = await import('../dist/services/finance/modules/ListPricingProductsService.js');
const { PricingSettingsService } = await import('../dist/services/finance/modules/PricingSettingsService.js');
const { UpdateProductPricingService } = await import('../dist/services/finance/modules/UpdateProductPricingService.js');
const { default: prismaClient } = await import('../dist/config/prisma.js');

after(async () => {
  await prismaClient.$disconnect();
  await rm(databasePath, { force: true });
});

test('pricing services expose validated settings, overview and post-recalculation Product contract', async () => {
  const suffix = Date.now();
  const ingredient = await prismaClient.ingredient.create({
    data: {
      sku: `PRICING-ING-${suffix}`,
      name: 'Insumo Pricing',
      price: 20,
      quantity: 10,
      unit: 'Gramas',
      position: 0
    }
  });

  const product = await prismaClient.product.create({
    data: {
      sku: `PRICING-PROD-${suffix}`,
      name: 'Produto Pricing',
      position: 0,
      recipe: {
        create: {
          position: 0,
          unitsPerBatch: 4,
          items: {
            create: {
              ingredientId: ingredient.id,
              quantityNeeded: 2
            }
          }
        }
      }
    }
  });

  const settingsService = new PricingSettingsService();
  const settings = await settingsService.update({
    maxProductionCap: 100,
    marginCategoryA: 45,
    marginCategoryB: 30,
    marginCategoryC: 20
  });

  assert.equal(settings.id, 'GLOBAL_CONFIG');
  assert.equal(settings.maxProductionCap, 100);
  assert.equal(typeof settings.updatedAt, 'string');

  const overview = await new ListPricingProductsService().execute();
  const listed = overview.products.find((item) => item.id === product.id);
  assert.ok(listed);
  assert.equal(listed.unitsPerBatch, 4);
  assert.equal(typeof overview.fixedCostPerUnitFactor, 'number');
  assert.equal(typeof overview.totalVariablePercent, 'number');

  const updated = await new UpdateProductPricingService().execute({
    id: product.id,
    finalPrice: 25,
    includeFixedCosts: 'NO'
  });

  assert.equal(updated.id, product.id);
  assert.equal(updated.finalPrice, 25);
  assert.equal(updated.includeFixedCosts, 'NO');
  assert.equal(updated.unitsPerBatch, 4);
  assert.equal(typeof updated.predictedNetProfit, 'number');
  assert.equal('recipe' in updated, false);

  const persisted = await prismaClient.product.findUnique({ where: { id: product.id } });
  assert.equal(persisted?.finalPrice, 25);
  assert.equal(persisted?.includeFixedCosts, 'NO');
  assert.equal(persisted?.predictedNetProfit, updated.predictedNetProfit);

  await prismaClient.product.delete({ where: { id: product.id } });
  await prismaClient.ingredient.delete({ where: { id: ingredient.id } });
});

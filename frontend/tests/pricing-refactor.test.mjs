import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const { APP_CONFIG } = await import('../src/config/app.config.ts');
const { UI_KEYS } = await import('../src/ui/keys.ts');
const {
  parsePricingOverviewResponse,
  parsePricingSettingsResponse
} = await import('../src/pages/Pricing/utils/pricingContract.ts');

function productResponse(overrides = {}) {
  return {
    id: 'pricing-product-1',
    sku: 'PRC-001',
    name: 'Produto Precificado',
    brand: 'Marca',
    variation: null,
    description: null,
    thumbnail: null,
    medias: [],
    status: 'ACTIVE',
    abcCategory: 'B',
    recipeCostPerUnit: 4,
    indirectCost: 1,
    totalUnitCost: 6,
    unitsPerBatch: 3,
    suggestedPrice: 12,
    finalPrice: 13,
    predictedNetProfit: 7,
    includeFixedCosts: 'DEFAULT',
    position: 0,
    createdAt: '2026-08-09T00:00:00.000Z',
    updatedAt: '2026-08-09T00:00:00.000Z',
    ...overrides
  };
}

async function collectTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectTypeScriptFiles(path));
    else if (/\.tsx?$/.test(entry.name)) files.push(path);
  }
  return files;
}

test('Pricing overview parser validates metrics and canonical Product contracts', () => {
  const parsed = parsePricingOverviewResponse({
    fixedCostPerUnitFactor: 2.5,
    totalVariablePercent: 8,
    products: [productResponse()]
  });

  assert.ok(parsed);
  assert.equal(parsed.fixedCostPerUnitFactor, 2.5);
  assert.equal(parsed.products[0]?.brand, 'Marca');
  assert.equal(parsePricingOverviewResponse({ fixedCostPerUnitFactor: '2', totalVariablePercent: 8, products: [] }), null);
  assert.equal(parsePricingOverviewResponse({ fixedCostPerUnitFactor: 2, totalVariablePercent: 8, products: [productResponse({ id: '' })] }), null);
});

test('Pricing settings parser rejects malformed runtime responses', () => {
  const settings = parsePricingSettingsResponse({
    id: 'GLOBAL_CONFIG',
    maxProductionCap: 1500,
    marginCategoryA: 50,
    marginCategoryB: 30,
    marginCategoryC: 20,
    enableAutoABC: false,
    updatedAt: '2026-08-09T00:00:00.000Z'
  });

  assert.ok(settings);
  assert.equal(settings.maxProductionCap, 1500);
  assert.equal(parsePricingSettingsResponse({ ...settings, enableAutoABC: 'false' }), null);
});

test('Pricing operational values and real backend endpoints are centralized', () => {
  assert.equal(APP_CONFIG.api.endpoints.pricing.products, '/pricing/products');
  assert.equal(APP_CONFIG.api.endpoints.pricing.settings, '/settings');
  assert.equal(APP_CONFIG.pricing.interactions.productSaveDebounceMs, 800);
  assert.equal(APP_CONFIG.pricing.limits.maxMarginPercent, 100);
  assert.equal(UI_KEYS.pricing.productFinalPrice, 'pricing.products.finalPrice');
});

test('Pricing module uses service, text, theme and UI-key boundaries', async () => {
  const sourceRoot = fileURLToPath(new URL('../src/pages/Pricing/', import.meta.url));
  const files = await collectTypeScriptFiles(sourceRoot);
  const sources = await Promise.all(files.map(async (file) => ({ file, source: await readFile(file, 'utf8') })));
  const serviceSources = sources.filter(({ file }) => file.includes('/services/'));
  const consumerSources = sources.filter(({ file }) => !file.includes('/services/'));
  const allSource = sources.map(({ source }) => source).join('\n');
  const consumerSource = consumerSources.map(({ source }) => source).join('\n');
  const serviceSource = serviceSources.map(({ source }) => source).join('\n');

  assert.doesNotMatch(consumerSource, /api\/client/);
  assert.match(serviceSource, /api\/client/);
  assert.match(serviceSource, /APP_CONFIG\.api\.endpoints\.pricing/);
  assert.doesNotMatch(allSource, /console\.(?:log|warn|error)/);
  assert.doesNotMatch(allSource, /:\s*any\b|as\s+any\b/);
  assert.match(allSource, /pricingService/);
  assert.match(allSource, /TEXTS\.pricing/);
  assert.match(allSource, /ERP_THEME\.pricing/);
  assert.match(allSource, /UI_KEYS\.pricing/);
  assert.doesNotMatch(allSource, /['"]\/pricing\/settings['"]/);
});

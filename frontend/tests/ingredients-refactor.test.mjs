import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const { APP_CONFIG } = await import('../src/config/app.config.ts');
const { UI_KEYS } = await import('../src/ui/keys.ts');
const { parseIngredientResponse, parseIngredientList } = await import('../src/pages/Ingredients/utils/ingredientContract.ts');
const { calculateIngredientMetrics, filterIngredients, reorderVisibleIngredients } = await import('../src/pages/Ingredients/utils/ingredientCatalog.ts');

function ingredientResponse(overrides = {}) {
  return {
    id: 'ingredient-1',
    sku: 'CACAU-01',
    name: 'Cacau em pó',
    price: 20,
    quantity: 500,
    unit: 'Gramas',
    thumbnail: null,
    medias: [{ id: 'media-1', name: 'ficha.pdf', url: '/files/ficha.pdf', type: 'document' }],
    status: 'ACTIVE',
    position: 0,
    createdAt: '2026-08-09T10:00:00.000Z',
    updatedAt: '2026-08-09T10:00:00.000Z',
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

test('Ingredients contract accepts native and controlled legacy media JSON', () => {
  const native = parseIngredientResponse(ingredientResponse());
  const legacy = parseIngredientResponse(ingredientResponse({ medias: JSON.stringify(ingredientResponse().medias) }));

  assert.equal(native?.medias[0]?.type, 'document');
  assert.equal(legacy?.medias[0]?.name, 'ficha.pdf');
  assert.equal(parseIngredientResponse(ingredientResponse({ status: 'UNKNOWN' })), null);
  assert.equal(parseIngredientResponse(ingredientResponse({ price: Number.NaN })), null);
});

test('Ingredients metrics ignore inactive rows and filters stay deterministic', () => {
  const active = parseIngredientResponse(ingredientResponse());
  const inactive = parseIngredientResponse(ingredientResponse({ id: 'ingredient-2', name: 'Leite', price: 10, unit: 'MLs', status: 'INACTIVE', position: 1 }));
  assert.ok(active && inactive);

  assert.deepEqual(calculateIngredientMetrics([active, inactive]), { totalIngredientsCount: 1, averagePrice: 20 });

  const filtered = filterIngredients(
    [inactive, active],
    { search: 'cacau', sortBy: 'az', abcCategory: 'all', unitFilter: 'Gramas' },
    []
  );
  assert.deepEqual(filtered.map((item) => item.id), ['ingredient-1']);
});

test('filtered ingredient reorder preserves hidden slots and returns complete positions', () => {
  const all = parseIngredientList([
    ingredientResponse({ id: 'a', position: 0 }),
    ingredientResponse({ id: 'hidden', name: 'Hidden', position: 1 }),
    ingredientResponse({ id: 'b', name: 'B', position: 2 })
  ]);
  assert.ok(all);

  const result = reorderVisibleIngredients(all, [all[0], all[2]], 0, 1);
  assert.ok(result);
  assert.deepEqual(result.ingredients.map((item) => item.id), ['b', 'hidden', 'a']);
  assert.deepEqual(result.positions.map((item) => item.position), [0, 1, 2]);
});

test('Ingredients configuration centralizes scoped endpoints and limits', () => {
  assert.equal(APP_CONFIG.api.endpoints.ingredients.catalog, '/ingredients');
  assert.equal(APP_CONFIG.api.endpoints.ingredients.reorder, '/ingredients/reorder');
  assert.equal(APP_CONFIG.api.endpoints.ingredients.versions('a b'), '/ingredients/a%20b/versions');
  assert.equal(APP_CONFIG.api.endpoints.ingredients.orderProfiles, '/ingredients/orders');
  assert.equal(APP_CONFIG.api.endpoints.uploads.ingredients, '/ingredients/upload');
  assert.equal(APP_CONFIG.ingredients.limits.minQuantity, 0.01);
  assert.equal(UI_KEYS.ingredients.formPrice, 'ingredients.form.price');
});

test('Ingredients module enforces service-only HTTP and centralized boundaries', async () => {
  const sourceRoot = fileURLToPath(new URL('../src/pages/Ingredients/', import.meta.url));
  const files = await collectTypeScriptFiles(sourceRoot);
  const serviceFiles = files.filter((file) => file.includes(`${join('Ingredients', 'services')}`));
  const nonServiceFiles = files.filter((file) => !serviceFiles.includes(file));
  const serviceSource = (await Promise.all(serviceFiles.map((file) => readFile(file, 'utf8')))).join('\n');
  const nonServiceSource = (await Promise.all(nonServiceFiles.map((file) => readFile(file, 'utf8')))).join('\n');
  const combined = `${serviceSource}\n${nonServiceSource}`;

  assert.match(serviceSource, /api\/client/);
  assert.doesNotMatch(nonServiceSource, /api\/client/);
  assert.doesNotMatch(nonServiceSource, /useGridGestures/);
  assert.doesNotMatch(nonServiceSource, /console\.(?:log|warn|error)/);
  assert.doesNotMatch(combined, /:\s*any\b|as\s+any\b/);
  assert.match(combined, /TEXTS\.ingredients/);
  assert.match(combined, /ERP_THEME\.ingredients/);
  assert.match(combined, /UI_KEYS\.ingredients/);
  assert.match(combined, /ingredientsService/);
});

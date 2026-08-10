import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const { reorderVisibleGridItems } = await import('../src/utils/gridOrder.ts');
const { getToggledProductStatus } = await import('../src/pages/Products/utils/productStatus.ts');

test('generic filtered reorder preserves hidden slots and returns a complete payload', () => {
  const current = [
    { id: 'visible-a', position: 0 },
    { id: 'hidden-b', position: 1 },
    { id: 'visible-c', position: 2 },
    { id: 'visible-d', position: 3 }
  ];
  const visible = [current[0], current[2], current[3]];

  const reordered = reorderVisibleGridItems(current, visible, 2, 0);

  assert.deepEqual(reordered?.items.map(({ id, position }) => ({ id, position })), [
    { id: 'visible-d', position: 0 },
    { id: 'hidden-b', position: 1 },
    { id: 'visible-a', position: 2 },
    { id: 'visible-c', position: 3 }
  ]);
  assert.deepEqual(reordered?.positions, reordered?.items.map(({ id, position }) => ({ id, position })));
});

test('generic reorder ignores unchanged and invalid drag results', () => {
  const items = [{ id: 'product-a', position: 0 }];

  assert.equal(reorderVisibleGridItems(items, items, 0, 0), null);
  assert.equal(reorderVisibleGridItems(items, items, 4, 0), null);
});

test('Product status transition remains reversible and domain-owned', () => {
  assert.equal(getToggledProductStatus('ACTIVE'), 'INACTIVE');
  assert.equal(getToggledProductStatus('INACTIVE'), 'ACTIVE');
});

test('generic gesture hook delegates HTTP and contains no Product or Agenda rules', async () => {
  const source = await readFile(new URL('../src/hooks/useGridGestures.ts', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /api\/client|\bapi\.(?:get|post|put|patch|delete)\b/);
  assert.doesNotMatch(source, /\/products|\/appointments|ACTIVE|INACTIVE|PENDING|COMPLETED|CANCELED|sub-status/);
  assert.doesNotMatch(source, /:\s*any\b|as\s+any\b|\bconsole\.(?:log|info|warn|error|debug)\b/);
  assert.match(source, /persistReorder:\s*\(positions: GridOrderPosition\[\]\) => Promise<void>/);
  assert.match(source, /onReorderError:\s*\(error: unknown\)/);
});

test('Product orchestrator delegates reorder and status HTTP to its module service', async () => {
  const actions = await readFile(new URL('../src/pages/Products/hooks/useProductsActions.ts', import.meta.url), 'utf8');
  const page = await readFile(new URL('../src/pages/Products/ProductsPage.tsx', import.meta.url), 'utf8');
  const service = await readFile(new URL('../src/pages/Products/services/products.service.ts', import.meta.url), 'utf8');

  assert.doesNotMatch(actions, /api\/client|\bapi\.(?:get|post|put|patch|delete)\b/);
  assert.match(actions, /persistReorder:\s*productsService\.reorder/);
  assert.match(actions, /productsService\.updateStatus/);
  assert.match(actions, /getToggledProductStatus/);
  assert.match(service, /async updateStatus\(/);
  assert.match(service, /async reorder\(/);
  assert.match(service, /APP_CONFIG\.api\.endpoints\.products\.status/);
  assert.match(service, /APP_CONFIG\.api\.endpoints\.products\.reorder/);
  assert.doesNotMatch(`${actions}\n${page}\n${service}`, /:\s*any\b|as\s+any\b/);
});

test('lazy page loading is protected by a centralized, observable ErrorBoundary', async () => {
  const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const boundary = await readFile(new URL('../src/components/PageErrorBoundary.tsx', import.meta.url), 'utf8');
  const dateFilters = await readFile(new URL('../src/utils/dateFilters.ts', import.meta.url), 'utf8');
  const login = await readFile(new URL('../src/pages/Login/LoginPage.tsx', import.meta.url), 'utf8');

  assert.match(app, /<PageErrorBoundary key=\{location\.key\}>/);
  assert.match(app, /<Suspense fallback=\{<RouteLoading \/>\}>/);
  assert.match(boundary, /componentDidCatch/);
  assert.match(boundary, /CustomLogger\.error/);
  assert.match(boundary, /TEXTS\.common\.pageLoadError/);
  assert.match(boundary, /ERP_THEME\.app\.routeError/);
  assert.match(boundary, /UI_KEYS\.app\.routeError/);
  assert.doesNotMatch(boundary, /:\s*any\b|as\s+any\b|\bconsole\./);
  assert.doesNotMatch(dateFilters, /\bconsole\.(?:log|info|warn|error|debug)\b/);
  assert.doesNotMatch(login, /\bconsole\.(?:log|info|warn|error|debug)\b/);
});

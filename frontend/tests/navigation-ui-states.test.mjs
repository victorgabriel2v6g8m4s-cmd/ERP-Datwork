import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const {
  APP_MODULES,
  FEATURE_FLAGS,
  ROUTE_PATHS,
  TOP_TAB_MODULE_IDS,
  isModuleActive
} = await import('../src/config/routes.config.ts');
const { SYSTEM_TEXTS } = await import('../src/i18n/system.ts');

test('route metadata exposes one source of truth and marks unfinished modules', () => {
  assert.equal(ROUTE_PATHS.products, '/produtos');
  assert.equal(FEATURE_FLAGS.realAuthentication, false);
  assert.equal(APP_MODULES.inventory.availability, 'planned');
  assert.equal(APP_MODULES.dashboard.availability, 'planned');
  assert.equal(APP_MODULES.dre.availability, 'planned');
  assert.deepEqual(TOP_TAB_MODULE_IDS, ['products', 'recipes', 'pricing', 'expenses']);
  assert.equal(isModuleActive('/precificacao/produtos', APP_MODULES.pricing), true);
  assert.equal(isModuleActive('/produtos', APP_MODULES.recipes), false);
});

test('primary navigation no longer links to the broken standalone services route', async () => {
  const footer = await readFile(new URL('../src/components/GlobalFooterNav.tsx', import.meta.url), 'utf8');
  const home = await readFile(new URL('../src/pages/Home/HomePage.tsx', import.meta.url), 'utf8');
  const registry = await readFile(new URL('../src/navigation/navigation.registry.ts', import.meta.url), 'utf8');

  assert.doesNotMatch(`${footer}\n${home}\n${registry}`, /['"]\/servicos['"]/);
  assert.match(footer, /module\.availability === 'available'/);
  assert.match(footer, /disabled=!\{isAvailable\}|disabled=\{!isAvailable\}/);
  assert.match(home, /NAVIGATION_GROUP_VIEWS/);
});

test('login is accessible and explicitly identifies the unauthenticated development mode', async () => {
  const login = await readFile(new URL('../src/pages/Login/LoginPage.tsx', import.meta.url), 'utf8');

  assert.match(SYSTEM_TEXTS.login.demoNotice, /ainda não autentica/i);
  assert.match(login, /htmlFor="demo-username"/);
  assert.match(login, /htmlFor="demo-password"/);
  assert.match(login, /autoComplete="username"/);
  assert.match(login, /autoComplete="current-password"/);
  assert.match(login, /role="alert"/);
  assert.match(login, /\.current\?\.focus\(\)/);
  assert.doesNotMatch(login, /Validação de acesso simulada|PrivateRoute/);
});

test('catalog pages distinguish loading, error and empty states with retry', async () => {
  const pageUrls = [
    '../src/pages/Products/ProductsPage.tsx',
    '../src/pages/Recipes/RecipesPage.tsx',
    '../src/pages/Ingredients/IngredientsPage.tsx'
  ];

  for (const pageUrl of pageUrls) {
    const source = await readFile(new URL(pageUrl, import.meta.url), 'utf8');
    assert.match(source, /AsyncCollectionState/);
    assert.match(source, /errorMessage=/);
    assert.match(source, /isEmpty=/);
    assert.match(source, /onRetry=/);
  }

  const state = await readFile(new URL('../src/components/states/AsyncCollectionState.tsx', import.meta.url), 'utf8');
  assert.match(state, /role="status"/);
  assert.match(state, /role="alert"/);
  assert.match(state, /SYSTEM_TEXTS\.feedback\.retry/);
});

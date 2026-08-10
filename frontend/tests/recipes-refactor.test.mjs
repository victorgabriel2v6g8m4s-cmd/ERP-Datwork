import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const { APP_CONFIG } = await import('../src/config/app.config.ts');
const { TEXTS } = await import('../src/i18n/index.ts');
const { ERP_THEME } = await import('../src/theme/presets.ts');
const { UI_KEYS } = await import('../src/ui/keys.ts');
const { parseRecipeList, parseRecipeResponse } = await import('../src/pages/Recipes/utils/recipeContract.ts');
const { calculatePersistedRecipeCosts } = await import('../src/pages/Recipes/utils/recipeCalculations.ts');
const { reorderVisibleRecipes } = await import('../src/pages/Recipes/utils/recipeOrder.ts');

function recipeResponse(overrides = {}) {
  return {
    id: 'recipe-1',
    productId: 'product-1',
    status: 'ACTIVE',
    position: 0,
    unitsPerBatch: 4,
    createdAt: '2026-08-09T00:00:00.000Z',
    updatedAt: '2026-08-09T00:00:00.000Z',
    product: {
      sku: 'SKU-001',
      name: 'Produto Receita',
      thumbnail: null,
      abcCategory: 'B',
      recipeCostPerUnit: 2,
      indirectCost: 1,
      totalUnitCost: 3
    },
    items: [{
      id: 'item-1',
      recipeId: 'recipe-1',
      ingredientId: 'ingredient-1',
      quantityNeeded: 2,
      ingredient: {
        name: 'Insumo',
        price: 10,
        quantity: 5,
        unit: 'Gramas'
      }
    }],
    ...overrides
  };
}

test('Recipe parser accepts canonical active and inactive response contracts', () => {
  const active = parseRecipeResponse(recipeResponse());
  const inactive = parseRecipeResponse(recipeResponse({ id: 'recipe-2', status: 'INACTIVE' }));

  assert.ok(active);
  assert.ok(inactive);
  assert.equal(active.unitsPerBatch, 4);
  assert.equal(active.product.name, 'Produto Receita');
  assert.equal(parseRecipeList([recipeResponse(), recipeResponse({ id: 'recipe-2', status: 'INACTIVE' })])?.length, 2);
});

test('Recipe parser rejects partial and malformed relation contracts', () => {
  assert.equal(parseRecipeResponse(recipeResponse({ status: 'DELETED' })), null);
  assert.equal(parseRecipeResponse(recipeResponse({ unitsPerBatch: 0 })), null);
  assert.equal(parseRecipeResponse(recipeResponse({ product: { sku: 'x' } })), null);
  assert.equal(parseRecipeList({ recipes: [] }), null);
});

test('Recipe cost calculation uses recipe unitsPerBatch as the source of truth', () => {
  const recipe = parseRecipeResponse(recipeResponse());
  assert.ok(recipe);

  const costs = calculatePersistedRecipeCosts(recipe);
  assert.equal(costs.batchCost, 4);
  assert.equal(costs.unitCost, 1);
});

test('filtered recipe reorder preserves hidden slots and restores contiguous positions', () => {
  const recipes = [
    parseRecipeResponse(recipeResponse({ id: 'a', position: 0 })),
    parseRecipeResponse(recipeResponse({ id: 'hidden', position: 1 })),
    parseRecipeResponse(recipeResponse({ id: 'b', position: 2 })),
    parseRecipeResponse(recipeResponse({ id: 'c', position: 3 }))
  ];

  assert.ok(recipes.every(Boolean));
  const typedRecipes = recipes.filter(Boolean);
  const visible = [typedRecipes[0], typedRecipes[2], typedRecipes[3]];
  const reordered = reorderVisibleRecipes(typedRecipes, visible, 2, 0);

  assert.ok(reordered);
  assert.deepEqual(reordered.map((recipe) => recipe.id), ['c', 'hidden', 'a', 'b']);
  assert.deepEqual(reordered.map((recipe) => recipe.position), [0, 1, 2, 3]);
});

test('Recipes uses centralized text, style, config and stable UI keys', async () => {
  const page = await readFile(new URL('../src/pages/Recipes/RecipesPage.tsx', import.meta.url), 'utf8');
  const editor = await readFile(new URL('../src/pages/Recipes/components/RecipeEditorModal.tsx', import.meta.url), 'utf8');
  const actions = await readFile(new URL('../src/pages/Recipes/hooks/useRecipesActions.ts', import.meta.url), 'utf8');

  assert.equal(APP_CONFIG.recipes.defaults.unitsPerBatch, 1);
  assert.equal(APP_CONFIG.api.endpoints.recipes.item('recipe/a'), '/recipes/recipe%2Fa');
  assert.equal(TEXTS.recipes.page.title, 'Fichas Técnicas');
  assert.ok(ERP_THEME.recipes.page.createFab.length > 0);
  assert.equal(UI_KEYS.recipes.formSubmit, 'recipes.form.submit');
  assert.match(page, /TEXTS\.recipes\.page/);
  assert.match(page, /ERP_THEME\.recipes/);
  assert.match(page, /UI_KEYS\.recipes/);
  assert.match(editor, /TEXTS\.recipes\.form/);
  assert.doesNotMatch(page, /from ['"]\.\.\/\.\.\/api\/client/);
  assert.doesNotMatch(actions, /api\.\w+\(/);
});

test('Recipe mutations consume canonical responses without normal-path catalog refetches', async () => {
  const service = await readFile(new URL('../src/pages/Recipes/services/recipes.service.ts', import.meta.url), 'utf8');
  const actions = await readFile(new URL('../src/pages/Recipes/hooks/useRecipesActions.ts', import.meta.url), 'utf8');

  assert.match(service, /APP_CONFIG\.api\.endpoints\.recipes\.catalog/);
  assert.match(service, /requireRecipe\(response\.data, 'create'\)/);
  assert.match(service, /requireRecipeList\(response\.data\)/);
  assert.match(actions, /const created = await recipesService\.create\(payload\)/);
  assert.match(actions, /const updated = await recipesService\.update\(id, payload\)/);
  assert.match(actions, /const persisted = await recipesService\.reorder/);
});

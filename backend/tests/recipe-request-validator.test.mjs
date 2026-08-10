import test from 'node:test';
import assert from 'node:assert/strict';

const {
  parseRecipeCreate,
  parseRecipePositions,
  parseRecipeStatus,
  parseRecipeUpdate
} = await import('../dist/controllers/recipe/utils/RecipeRequestValidator.js');

const canonicalMutation = {
  unitsPerBatch: 8,
  ingredients: [
    { ingredientId: 'ingredient-a', quantityNeeded: 2.5 },
    { ingredientId: 'ingredient-b', quantityNeeded: 1 }
  ]
};

test('recipe request validator accepts canonical create and update payloads', () => {
  assert.deepEqual(parseRecipeCreate({ productId: ' product-a ', ...canonicalMutation }), {
    productId: 'product-a',
    ...canonicalMutation
  });
  assert.deepEqual(parseRecipeUpdate(' recipe-a ', canonicalMutation), {
    id: 'recipe-a',
    ...canonicalMutation
  });
  assert.equal(parseRecipeStatus({ status: 'INACTIVE' }), 'INACTIVE');
});

test('recipe request validator rejects unsafe numbers, empty compositions and duplicate ingredients', () => {
  assert.throws(
    () => parseRecipeCreate({ productId: 'product-a', ...canonicalMutation, unitsPerBatch: 1.5 }),
    /rendimento por lote/i
  );
  assert.throws(
    () => parseRecipeCreate({ productId: 'product-a', ...canonicalMutation, ingredients: [] }),
    /ao menos um insumo/i
  );
  assert.throws(
    () => parseRecipeCreate({
      productId: 'product-a',
      ...canonicalMutation,
      ingredients: [{ ingredientId: 'ingredient-a', quantityNeeded: Number.NaN }]
    }),
    /número finito/i
  );
  assert.throws(
    () => parseRecipeCreate({
      productId: 'product-a',
      ...canonicalMutation,
      ingredients: [
        { ingredientId: 'ingredient-a', quantityNeeded: 1 },
        { ingredientId: 'ingredient-a', quantityNeeded: 2 }
      ]
    }),
    /repetir o mesmo insumo/i
  );
  assert.throws(() => parseRecipeStatus({ status: 'DELETED' }), /ACTIVE ou INACTIVE/);
});

test('recipe reorder validator requires a complete contiguous shape without duplicate IDs or positions', () => {
  assert.deepEqual(parseRecipePositions({
    positions: [{ id: 'recipe-a', position: 0 }, { id: 'recipe-b', position: 1 }]
  }), [
    { id: 'recipe-a', position: 0 },
    { id: 'recipe-b', position: 1 }
  ]);

  assert.throws(() => parseRecipePositions({
    positions: [{ id: 'recipe-a', position: 0 }, { id: 'recipe-b', position: 0 }]
  }), /únicos/i);
  assert.throws(() => parseRecipePositions({
    positions: [{ id: 'recipe-a', position: 0 }, { id: 'recipe-a', position: 1 }]
  }), /únicos/i);
  assert.throws(() => parseRecipePositions({
    positions: [{ id: 'recipe-a', position: 0 }, { id: 'recipe-b', position: 2 }]
  }), /sequência contínua/i);
});

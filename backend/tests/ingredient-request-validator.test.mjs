import test from 'node:test';
import assert from 'node:assert/strict';

const {
  parseIngredientMutation,
  parseIngredientStatus,
  parseOrderPositions
} = await import('../dist/controllers/ingredient/utils/IngredientRequestValidator.js');

test('ingredient request validator accepts canonical payloads and rejects unsafe numeric or media values', () => {
  const parsed = parseIngredientMutation({
    sku: ' cacau-01 ',
    name: ' Cacau ',
    price: 12.5,
    quantity: 500,
    unit: 'Gramas',
    thumbnail: null,
    medias: [{ id: 'm1', name: 'Foto', url: '/foto.jpg', type: 'image' }]
  });

  assert.equal(parsed.sku, 'CACAU-01');
  assert.equal(parsed.name, 'Cacau');
  assert.equal(parsed.medias[0]?.type, 'image');
  assert.throws(() => parseIngredientMutation({ ...parsed, price: Number.NaN }), /InvalidIngredientPayload/);
  assert.throws(() => parseIngredientMutation({ ...parsed, quantity: 0 }), /InvalidIngredientPayload/);
  assert.throws(() => parseIngredientMutation({ ...parsed, unit: 'Caixas' }), /InvalidIngredientPayload/);
  assert.throws(() => parseIngredientMutation({ ...parsed, medias: [{ id: 'm1', name: 'x', url: '/x', type: 'script' }] }), /InvalidIngredientPayload/);
});

test('ingredient status and reorder validators reject invalid enums and duplicate positions', () => {
  assert.equal(parseIngredientStatus({ status: 'INACTIVE' }), 'INACTIVE');
  assert.throws(() => parseIngredientStatus({ status: 'DELETED' }), /InvalidIngredientStatus/);

  assert.deepEqual(parseOrderPositions({ positions: [{ id: 'a', position: 0 }, { id: 'b', position: 1 }] }), [
    { id: 'a', position: 0 },
    { id: 'b', position: 1 }
  ]);
  assert.throws(() => parseOrderPositions({ positions: [{ id: 'a', position: 0 }, { id: 'b', position: 0 }] }), /InvalidOrderPositions/);
});

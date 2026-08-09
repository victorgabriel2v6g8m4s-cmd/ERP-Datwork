import test from 'node:test';
import assert from 'node:assert/strict';

const {
  PricingRequestValidationError,
  parsePricingSettingsMutation,
  parseProductPricingMutation
} = await import('../dist/controllers/finance/utils/PricingRequestValidator.js');

test('pricing validator normalizes supported product pricing fields', () => {
  assert.deepEqual(
    parseProductPricingMutation(' product-1 ', { finalPrice: '19.90', includeFixedCosts: 'YES' }),
    { id: 'product-1', finalPrice: 19.9, includeFixedCosts: 'YES' }
  );
});

test('pricing validator rejects invalid prices and fixed-cost enum values', () => {
  assert.throws(() => parseProductPricingMutation('p1', { finalPrice: -1 }), PricingRequestValidationError);
  assert.throws(() => parseProductPricingMutation('p1', { finalPrice: 'NaN' }), PricingRequestValidationError);
  assert.throws(() => parseProductPricingMutation('p1', { includeFixedCosts: 'SOMETIMES' }), PricingRequestValidationError);
  assert.throws(() => parseProductPricingMutation('', { finalPrice: 1 }), PricingRequestValidationError);
  assert.throws(() => parseProductPricingMutation('p1', {}), PricingRequestValidationError);
});

test('pricing settings validator enforces production and margin boundaries', () => {
  assert.deepEqual(
    parsePricingSettingsMutation({
      maxProductionCap: '1500',
      marginCategoryA: 50,
      marginCategoryB: 30,
      marginCategoryC: 20,
      enableAutoABC: true
    }),
    {
      maxProductionCap: 1500,
      marginCategoryA: 50,
      marginCategoryB: 30,
      marginCategoryC: 20,
      enableAutoABC: true
    }
  );

  assert.throws(() => parsePricingSettingsMutation({ maxProductionCap: 0 }), PricingRequestValidationError);
  assert.throws(() => parsePricingSettingsMutation({ marginCategoryA: 101 }), PricingRequestValidationError);
  assert.throws(() => parsePricingSettingsMutation({ marginCategoryC: -1 }), PricingRequestValidationError);
  assert.throws(() => parsePricingSettingsMutation({ enableAutoABC: 'true' }), PricingRequestValidationError);
  assert.throws(() => parsePricingSettingsMutation({}), PricingRequestValidationError);
});

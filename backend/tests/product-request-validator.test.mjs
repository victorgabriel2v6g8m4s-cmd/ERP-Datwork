import test from 'node:test';
import assert from 'node:assert/strict';

const {
    ProductRequestValidationError,
    parseOptionalAbcCategory,
    parseOptionalCostInclusion,
    parseOptionalNonNegativeNumber,
    parseOptionalProductMedias,
    parseProductPositions,
    parseRequiredNonEmptyString
} = await import('../dist/controllers/product/utils/ProductRequestValidator.js');

test('product request validator normalizes required text and non-negative numbers', () => {
    assert.equal(parseRequiredNonEmptyString('  SKU-1  ', 'sku'), 'SKU-1');
    assert.equal(parseOptionalNonNegativeNumber('12.50', 'indirectCost'), 12.5);
    assert.equal(parseOptionalNonNegativeNumber(0, 'finalPrice'), 0);
});

test('product request validator rejects unsafe numeric and enum values', () => {
    assert.throws(
        () => parseOptionalNonNegativeNumber(-0.01, 'finalPrice'),
        ProductRequestValidationError
    );
    assert.throws(() => parseOptionalAbcCategory('Z'), ProductRequestValidationError);
    assert.throws(() => parseOptionalCostInclusion('SOMETIMES'), ProductRequestValidationError);
});

test('product request validator accepts current enum values', () => {
    assert.equal(parseOptionalAbcCategory('A'), 'A');
    assert.equal(parseOptionalCostInclusion('DEFAULT'), 'DEFAULT');
});

test('product media validation accepts arrays and legacy serialized arrays', () => {
    const media = {
        id: 'media-1',
        name: 'manual.pdf',
        url: '/files/manual.pdf',
        type: 'document'
    };

    assert.deepEqual(parseOptionalProductMedias([media]), [media]);
    assert.deepEqual(parseOptionalProductMedias(JSON.stringify([media])), [media]);
});

test('product media validation rejects malformed entries', () => {
    assert.throws(
        () => parseOptionalProductMedias([{ id: 'media-1', name: '', url: '/file', type: 'image' }]),
        ProductRequestValidationError
    );
    assert.throws(() => parseOptionalProductMedias('{invalid-json'), ProductRequestValidationError);
});

test('product reorder validator requires unique IDs and a complete non-negative integer sequence', () => {
    assert.deepEqual(parseProductPositions({
        positions: [
            { id: ' product-b ', position: '0' },
            { id: 'product-a', position: 1 }
        ]
    }), [
        { id: 'product-b', position: 0 },
        { id: 'product-a', position: 1 }
    ]);

    assert.throws(() => parseProductPositions({
        positions: [{ id: 'product-a', position: 0 }, { id: 'product-a', position: 1 }]
    }), ProductRequestValidationError);
    assert.throws(() => parseProductPositions({
        positions: [{ id: 'product-a', position: 0 }, { id: 'product-b', position: 0 }]
    }), ProductRequestValidationError);
    assert.throws(() => parseProductPositions({
        positions: [{ id: 'product-a', position: 0 }, { id: 'product-b', position: 2 }]
    }), ProductRequestValidationError);
    assert.throws(() => parseProductPositions({
        positions: [{ id: 'product-a', position: -1 }]
    }), ProductRequestValidationError);
    assert.throws(() => parseProductPositions({
        positions: [{ id: 'product-a', position: 0.5 }]
    }), ProductRequestValidationError);
});

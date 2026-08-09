import test from 'node:test';
import assert from 'node:assert/strict';

const {
    buildProductMutationPayload,
    calculateProductCostPreview,
    createProductFormValues,
    parseProductMedias,
    parseProductSnapshot,
    validateProductForm,
    validateProductThumbnailFile
} = await import('../src/pages/Products/utils/product-form.utils.ts');

function createProduct(overrides = {}) {
    return {
        id: 'product-1',
        sku: 'SKU-001',
        name: 'Produto Teste',
        brand: 'Marca',
        variation: 'V1',
        description: 'Descrição',
        status: 'ACTIVE',
        abcCategory: 'B',
        thumbnail: null,
        medias: [],
        recipeCostPerUnit: 12.5,
        indirectCost: 3.5,
        totalUnitCost: 18,
        unitsPerBatch: 8,
        suggestedPrice: 30,
        finalPrice: 32,
        predictedNetProfit: 9,
        includeFixedCosts: 'DEFAULT',
        position: 0,
        createdAt: '2026-08-09T00:00:00.000Z',
        updatedAt: '2026-08-09T00:00:00.000Z',
        ...overrides
    };
}

test('product form hydrates current backend fields and native JSON medias', () => {
    const medias = [{ id: 'm1', name: 'foto.png', url: '/files/foto.png', type: 'image' }];
    const values = createProductFormValues(createProduct({ medias }));

    assert.equal(values.indirectCost, 3.5);
    assert.equal(values.finalPrice, 32);
    assert.equal(values.recipeCostPerUnit, 12.5);
    assert.equal(values.unitsPerBatch, 8);
    assert.equal(values.abcCategory, 'B');
    assert.deepEqual(values.medias, medias);
});

test('product media parser supports legacy serialized JSON and rejects malformed entries', () => {
    const serialized = JSON.stringify([
        { id: 'm1', name: 'manual.pdf', url: '/files/manual.pdf', type: 'document' },
        { id: '', name: 'invalid', url: '/invalid', type: 'image' }
    ]);

    assert.deepEqual(parseProductMedias(serialized), [
        { id: 'm1', name: 'manual.pdf', url: '/files/manual.pdf', type: 'document' }
    ]);
    assert.deepEqual(parseProductMedias('{invalid-json'), []);
});

test('cost preview is deterministic and does not trust client totalUnitCost', () => {
    const preview = calculateProductCostPreview({
        recipeCostPerUnit: 12.5,
        unitsPerBatch: 8,
        indirectCost: 3.5
    });

    assert.deepEqual(preview, {
        batchRecipeCost: 100,
        baseUnitCost: 16
    });
});

test('mutation payload only contains fields persisted by the current product contract', () => {
    const values = createProductFormValues(createProduct({ brand: '', variation: '', description: '' }));
    const payload = buildProductMutationPayload(values);

    assert.equal(payload.sku, 'SKU-001');
    assert.equal(payload.brand, 'Sem Marca');
    assert.equal(payload.variation, null);
    assert.equal(payload.description, null);
    assert.equal(payload.indirectCost, 3.5);
    assert.equal(payload.finalPrice, 32);
    assert.equal(payload.abcCategory, 'B');
    assert.equal(payload.includeFixedCosts, 'DEFAULT');
    assert.equal('totalUnitCost' in payload, false);
    assert.equal('recipeCostPerUnit' in payload, false);
    assert.equal('unitsPerBatch' in payload, false);
    assert.equal('stockQuantity' in payload, false);
});

test('form validation rejects blank identity and unsafe numeric values', () => {
    const values = createProductFormValues(null);
    values.indirectCost = Number.NaN;
    values.finalPrice = -1;

    const validation = validateProductForm(values);
    assert.equal(validation.isValid, false);
    assert.deepEqual(Object.keys(validation.errors).sort(), ['finalPrice', 'indirectCost', 'name', 'sku']);
});

test('product snapshots support Prisma JSON objects and legacy serialized snapshots', () => {
    const product = createProduct();

    assert.equal(parseProductSnapshot(product)?.id, 'product-1');
    assert.equal(parseProductSnapshot(JSON.stringify(product))?.sku, 'SKU-001');
    assert.equal(parseProductSnapshot('{invalid-json'), null);
});

test('thumbnail validation enforces supported image type and size', () => {
    assert.equal(validateProductThumbnailFile({ type: 'image/png', size: 1024 }), null);
    assert.match(validateProductThumbnailFile({ type: 'application/pdf', size: 1024 }), /Formato não permitido/);
    assert.match(validateProductThumbnailFile({ type: 'image/png', size: 6 * 1024 * 1024 }), /no máximo 5 MB/);
});

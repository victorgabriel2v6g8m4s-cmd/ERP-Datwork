import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const {
    parseProductList,
    parseProductResponse
} = await import('../src/utils/productContract.ts');

function productResponse(overrides = {}) {
    return {
        id: 'product-1',
        sku: 'SKU-001',
        name: 'Produto Contratado',
        brand: 'Marca',
        variation: null,
        description: null,
        thumbnail: null,
        medias: [{ id: 'm1', name: 'foto.png', url: '/files/foto.png', type: 'image' }],
        status: 'ACTIVE',
        abcCategory: 'A',
        recipeCostPerUnit: 2,
        indirectCost: 3,
        totalUnitCost: 5,
        unitsPerBatch: 4,
        suggestedPrice: 9,
        finalPrice: 10,
        predictedNetProfit: 5,
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
        if (entry.isDirectory()) {
            files.push(...await collectTypeScriptFiles(path));
        } else if (/\.tsx?$/.test(entry.name)) {
            files.push(path);
        }
    }

    return files;
}

test('Product response parser returns only the canonical read contract', () => {
    const parsed = parseProductResponse(productResponse({
        batchCost: 999,
        productionCost: 888,
        recipe: { id: 'internal-relation' }
    }));

    assert.ok(parsed);
    assert.equal('batchCost' in parsed, false);
    assert.equal('productionCost' in parsed, false);
    assert.equal('recipe' in parsed, false);
    assert.equal(parsed.brand, 'Marca');
    assert.equal(parsed.unitsPerBatch, 4);
});

test('Product response parser rejects invalid enum and media contracts', () => {
    assert.equal(parseProductResponse(productResponse({ status: 'DELETED' })), null);
    assert.equal(parseProductResponse(productResponse({ abcCategory: 'Z' })), null);
    assert.equal(parseProductResponse(productResponse({ medias: [{ id: 'x', name: 'x', url: '/x', type: 'binary' }] })), null);
});

test('Product list parser rejects partial malformed API responses', () => {
    assert.equal(parseProductList({ products: [] }), null);
    assert.equal(parseProductList([productResponse(), productResponse({ id: '' })]), null);
    assert.equal(parseProductList([])?.length, 0);
});

test('Product read type no longer exposes legacy aliases or string escape hatches', async () => {
    const source = await readFile(new URL('../src/types/product.ts', import.meta.url), 'utf8');

    assert.doesNotMatch(source, /batchCost/);
    assert.doesNotMatch(source, /productionCost/);
    assert.doesNotMatch(source, /abcCategory:\s*[^;]*\|\s*string/);
    assert.doesNotMatch(source, /includeFixedCosts:\s*[^;]*\|\s*string/);
    assert.match(source, /medias:\s*MediaItem\[\]/);
    assert.match(source, /interface ProductMutationInput/);
});

test('Products module does not consume removed Product legacy cost aliases', async () => {
    const sourceRoot = fileURLToPath(new URL('../src/pages/Products/', import.meta.url));
    const files = await collectTypeScriptFiles(sourceRoot);
    const offenders = [];

    for (const file of files) {
        const source = await readFile(file, 'utf8');
        if (/\b(?:batchCost|productionCost)\b/.test(source)) {
            offenders.push(file.replace(sourceRoot, ''));
        }
    }

    assert.deepEqual(offenders, []);
});

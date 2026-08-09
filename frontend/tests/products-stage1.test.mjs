import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const DEBUG_KEY = '@erpmagico:debug_mode';
const storage = new Map([[DEBUG_KEY, 'false']]);

globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
    key: (index) => Array.from(storage.keys())[index] ?? null,
    get length() {
        return storage.size;
    }
};

globalThis.window = globalThis;

const { parseProductOrderPositions } = await import('../src/pages/Products/services/products.service.ts');

test('parseProductOrderPositions accepts arrays and normalizes numeric positions', () => {
    const result = parseProductOrderPositions([
        { id: 'product-a', position: 0 },
        { id: 'product-b', position: '1' }
    ]);

    assert.deepEqual(result, [
        { id: 'product-a', position: 0 },
        { id: 'product-b', position: 1 }
    ]);
});

test('parseProductOrderPositions parses serialized profiles', () => {
    const result = parseProductOrderPositions(JSON.stringify([
        { id: 'product-a', position: 2 }
    ]));

    assert.deepEqual(result, [{ id: 'product-a', position: 2 }]);
});

test('parseProductOrderPositions rejects malformed, duplicate and unsafe positions', () => {
    const result = parseProductOrderPositions([
        { id: 'product-a', position: 0 },
        { id: 'product-a', position: 1 },
        { id: '', position: 2 },
        { id: 'negative', position: -1 },
        { id: 'decimal', position: 1.5 },
        null
    ]);

    assert.deepEqual(result, [{ id: 'product-a', position: 0 }]);
    assert.deepEqual(parseProductOrderPositions('{invalid-json'), []);
});

test('Products UI and orchestration do not bypass service boundaries', async () => {
    const files = [
        '../src/pages/Products/ProductsPage.tsx',
        '../src/pages/Products/hooks/useProductsActions.ts',
        '../src/pages/Products/hooks/useProductsFilters.ts',
        '../src/pages/Products/hooks/useProductForm.ts',
        '../src/pages/Products/components/CreateProductModal.tsx',
        '../src/pages/Products/components/EditProductModal.tsx',
        '../src/pages/Products/components/ViewProductModal.tsx',
        '../src/components/MediaManager.tsx'
    ];

    for (const relativePath of files) {
        const source = await readFile(new URL(relativePath, import.meta.url), 'utf8');

        assert.doesNotMatch(
            source,
            /api\/client|\baxios\b/,
            `${relativePath} must access HTTP through a service instead of the API client directly`
        );

        assert.doesNotMatch(
            source,
            /\bconsole\.(log|info|warn|error|debug)\b/,
            `${relativePath} must use CustomLogger instead of console.*`
        );
    }
});

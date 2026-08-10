import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createMigratedTestDatabase } from './helpers/create-test-database.mjs';

const databasePath = fileURLToPath(new URL('../product-contract-integration.db', import.meta.url));
const databaseUrl = 'file:./product-contract-integration.db';

process.env.DATABASE_URL = databaseUrl;
await createMigratedTestDatabase(databasePath);

const { CreateProductService } = await import('../dist/services/product/modules/CreateProductService.js');
const { UpdateProductService } = await import('../dist/services/product/modules/UpdateProductService.js');
const { UpdateProductStatusService } = await import('../dist/services/product/modules/UpdateProductStatusService.js');
const { default: prismaClient } = await import('../dist/config/prisma.js');

const RESPONSE_KEYS = [
    'abcCategory',
    'brand',
    'createdAt',
    'description',
    'finalPrice',
    'id',
    'includeFixedCosts',
    'indirectCost',
    'medias',
    'name',
    'position',
    'predictedNetProfit',
    'recipeCostPerUnit',
    'sku',
    'status',
    'suggestedPrice',
    'thumbnail',
    'totalUnitCost',
    'unitsPerBatch',
    'updatedAt',
    'variation'
].sort();

after(async () => {
    await prismaClient.$disconnect();
    await rm(databasePath, { force: true });
});

function assertProductContract(product) {
    assert.deepEqual(Object.keys(product).sort(), RESPONSE_KEYS);
    assert.equal(typeof product.createdAt, 'string');
    assert.equal(typeof product.updatedAt, 'string');
    assert.ok(Array.isArray(product.medias));
    assert.equal('recipe' in product, false);
    assert.equal('batchCost' in product, false);
    assert.equal('productionCost' in product, false);
}

test('CreateProductService persists data and returns the public Product contract', async () => {
    const service = new CreateProductService();
    const media = {
        id: 'media-contract-1',
        name: 'manual.pdf',
        url: '/files/manual.pdf',
        type: 'document'
    };

    const created = await service.execute({
        sku: `CONTRACT-${Date.now()}`,
        name: 'Produto de Contrato',
        brand: null,
        medias: [media],
        indirectCost: 4,
        finalPrice: 19.9,
        abcCategory: 'B',
        includeFixedCosts: 'DEFAULT'
    });

    assertProductContract(created);
    assert.equal(created.brand, 'Sem Marca');
    assert.equal(created.unitsPerBatch, 1);
    assert.equal(created.indirectCost, 4);
    assert.equal(created.totalUnitCost, 4);
    assert.deepEqual(created.medias, [media]);

    const persisted = await prismaClient.product.findUnique({ where: { id: created.id } });
    assert.equal(persisted?.sku, created.sku);
    assert.equal(persisted?.finalPrice, 19.9);
});

test('UpdateProductService returns post-PricingEngine metrics and recipe hydration', async () => {
    const createService = new CreateProductService();
    const updateService = new UpdateProductService();

    const created = await createService.execute({
        sku: `CONTRACT-UPD-${Date.now()}`,
        name: 'Produto Atualizável',
        indirectCost: 2,
        finalPrice: 10
    });

    await prismaClient.recipe.create({
        data: {
            productId: created.id,
            position: 0,
            unitsPerBatch: 6
        }
    });

    const updated = await updateService.execute({
        id: created.id,
        name: 'Produto Atualizado',
        indirectCost: 5,
        finalPrice: 25
    });

    assertProductContract(updated);
    assert.equal(updated.name, 'Produto Atualizado');
    assert.equal(updated.unitsPerBatch, 6);
    assert.equal(updated.indirectCost, 5);
    assert.equal(updated.totalUnitCost, 5);
    assert.equal(updated.finalPrice, 25);

    const persisted = await prismaClient.product.findUnique({ where: { id: created.id } });
    assert.equal(persisted?.totalUnitCost, updated.totalUnitCost);
    assert.equal(persisted?.predictedNetProfit, updated.predictedNetProfit);
});

test('UpdateProductStatusService persists its audit snapshot inside the status transaction', async () => {
    const created = await new CreateProductService().execute({
        sku: `CONTRACT-STATUS-${Date.now()}`,
        name: 'Produto com auditoria de status'
    });
    await prismaClient.recipe.create({
        data: { productId: created.id, position: 0, unitsPerBatch: 8 }
    });

    const updated = await new UpdateProductStatusService().execute(created.id, 'INACTIVE');
    assert.equal(updated.status, 'INACTIVE');

    const persisted = await prismaClient.product.findUnique({ where: { id: created.id } });
    const version = await prismaClient.productVersion.findFirst({
        where: { productId: created.id },
        orderBy: { versionDate: 'desc' }
    });

    assert.equal(persisted?.status, 'INACTIVE');
    assert.ok(version);
    assert.equal(version.snapshotData.status, 'INACTIVE');
    assert.equal(version.snapshotData.id, created.id);
    assert.equal(version.snapshotData.unitsPerBatch, 8);
});

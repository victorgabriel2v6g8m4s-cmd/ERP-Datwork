import { type Product as PrismaProduct, Prisma } from '@prisma/client';
import { type ProductMedia, type ProductMediaType, type ProductResponse } from '../../contracts/product/ProductContract.js';

export type PresentableProduct = PrismaProduct & {
    recipe?: { unitsPerBatch: number } | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseMediaType(value: unknown): ProductMediaType | null {
    return value === 'image' || value === 'video' || value === 'document' ? value : null;
}

function normalizeStoredMedias(value: Prisma.JsonValue | null): ProductMedia[] {
    let parsed: unknown = value;

    if (typeof parsed === 'string') {
        try {
            parsed = JSON.parse(parsed) as unknown;
        } catch {
            return [];
        }
    }

    if (!Array.isArray(parsed)) return [];

    const medias: ProductMedia[] = [];

    for (const entry of parsed) {
        if (!isRecord(entry)) continue;

        const id = typeof entry.id === 'string' ? entry.id.trim() : '';
        const name = typeof entry.name === 'string' ? entry.name.trim() : '';
        const url = typeof entry.url === 'string' ? entry.url.trim() : '';
        const type = parseMediaType(entry.type);

        if (!id || !name || !url || !type) continue;
        medias.push({ id, name, url, type });
    }

    return medias;
}

/**
 * Único ponto autorizado a converter o modelo persistido em contrato HTTP.
 * Evita espalhar `...product` pelos controllers e expor dados acidentalmente.
 */
export function presentProduct(product: PresentableProduct): ProductResponse {
    const unitsPerBatch = product.recipe?.unitsPerBatch;

    return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        brand: product.brand?.trim() || 'Sem Marca',
        variation: product.variation,
        description: product.description,
        status: product.status,
        abcCategory: product.abcCategory,
        thumbnail: product.thumbnail,
        medias: normalizeStoredMedias(product.medias),
        recipeCostPerUnit: product.recipeCostPerUnit,
        indirectCost: product.indirectCost,
        totalUnitCost: product.totalUnitCost,
        unitsPerBatch: Number.isInteger(unitsPerBatch) && Number(unitsPerBatch) > 0 ? Number(unitsPerBatch) : 1,
        suggestedPrice: product.suggestedPrice,
        finalPrice: product.finalPrice,
        predictedNetProfit: product.predictedNetProfit,
        includeFixedCosts: product.includeFixedCosts,
        position: product.position,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
    };
}

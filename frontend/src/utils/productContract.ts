import type { MediaItem, MediaType } from '../types/media.ts';
import type {
    Product,
    ProductAbcCategory,
    ProductCostInclusion,
    ProductStatus
} from '../types/product.ts';

interface ProductParseOptions {
    allowLegacyUnitsPerBatch?: boolean;
}

interface MediaParseResult {
    valid: boolean;
    items: MediaItem[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseRequiredString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function parseNullableString(value: unknown): string | null | undefined {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') return undefined;
    return value.trim() || null;
}

function parseFiniteNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function parsePosition(value: unknown): number | null {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}

function parseUnitsPerBatch(value: unknown): number | null {
    return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;
}

function parseStatus(value: unknown): ProductStatus | null {
    return value === 'ACTIVE' || value === 'INACTIVE' ? value : null;
}

function parseAbcCategory(value: unknown): ProductAbcCategory | null {
    return value === 'A' || value === 'B' || value === 'C' ? value : null;
}

function parseCostInclusion(value: unknown): ProductCostInclusion | null {
    return value === 'YES' || value === 'NO' || value === 'DEFAULT' ? value : null;
}

function parseMediaType(value: unknown): MediaType | null {
    return value === 'image' || value === 'video' || value === 'document' ? value : null;
}

function parseMediaCollection(value: unknown): MediaParseResult {
    let parsed: unknown = value;

    if (parsed === null || parsed === undefined || parsed === '') {
        return { valid: true, items: [] };
    }

    if (typeof parsed === 'string') {
        try {
            parsed = JSON.parse(parsed) as unknown;
        } catch {
            return { valid: false, items: [] };
        }
    }

    if (!Array.isArray(parsed)) return { valid: false, items: [] };

    const items: MediaItem[] = [];
    let valid = true;

    for (const entry of parsed) {
        if (!isRecord(entry)) {
            valid = false;
            continue;
        }

        const id = parseRequiredString(entry.id);
        const name = parseRequiredString(entry.name);
        const url = parseRequiredString(entry.url);
        const type = parseMediaType(entry.type);

        if (!id || !name || !url || !type) {
            valid = false;
            continue;
        }

        items.push({ id, name, url, type });
    }

    return { valid, items };
}

/** Compatibilidade controlada para formulários e snapshots legados. */
export function parseProductMedias(value: unknown): MediaItem[] {
    return parseMediaCollection(value).items;
}

export function parseProductResponse(value: unknown, options: ProductParseOptions = {}): Product | null {
    if (!isRecord(value)) return null;

    const id = parseRequiredString(value.id);
    const sku = parseRequiredString(value.sku);
    const name = parseRequiredString(value.name);
    const variation = parseNullableString(value.variation);
    const description = parseNullableString(value.description);
    const thumbnail = parseNullableString(value.thumbnail);
    const status = parseStatus(value.status);
    const abcCategory = parseAbcCategory(value.abcCategory);
    const recipeCostPerUnit = parseFiniteNumber(value.recipeCostPerUnit);
    const indirectCost = parseFiniteNumber(value.indirectCost);
    const totalUnitCost = parseFiniteNumber(value.totalUnitCost);
    const suggestedPrice = parseFiniteNumber(value.suggestedPrice);
    const finalPrice = parseFiniteNumber(value.finalPrice);
    const predictedNetProfit = parseFiniteNumber(value.predictedNetProfit);
    const includeFixedCosts = parseCostInclusion(value.includeFixedCosts);
    const position = parsePosition(value.position);
    const createdAt = parseRequiredString(value.createdAt);
    const updatedAt = parseRequiredString(value.updatedAt);
    const mediaResult = parseMediaCollection(value.medias);

    let unitsPerBatch = parseUnitsPerBatch(value.unitsPerBatch);
    if (unitsPerBatch === null && options.allowLegacyUnitsPerBatch) unitsPerBatch = 1;

    if (
        !id || !sku || !name ||
        variation === undefined || description === undefined || thumbnail === undefined ||
        !status || !abcCategory ||
        recipeCostPerUnit === null || indirectCost === null || totalUnitCost === null ||
        unitsPerBatch === null || suggestedPrice === null || finalPrice === null ||
        predictedNetProfit === null || !includeFixedCosts || position === null ||
        !createdAt || !updatedAt || !mediaResult.valid
    ) {
        return null;
    }

    if (value.brand !== null && value.brand !== undefined && typeof value.brand !== 'string') {
        return null;
    }

    const brand = typeof value.brand === 'string' && value.brand.trim()
        ? value.brand.trim()
        : 'Sem Marca';

    return {
        id,
        sku,
        name,
        brand,
        variation,
        description,
        thumbnail,
        medias: mediaResult.items,
        status,
        abcCategory,
        recipeCostPerUnit,
        indirectCost,
        totalUnitCost,
        unitsPerBatch,
        suggestedPrice,
        finalPrice,
        predictedNetProfit,
        includeFixedCosts,
        position,
        createdAt,
        updatedAt
    };
}

export function parseProductList(value: unknown): Product[] | null {
    if (!Array.isArray(value)) return null;

    const products: Product[] = [];
    for (const entry of value) {
        const product = parseProductResponse(entry);
        if (!product) return null;
        products.push(product);
    }

    return products;
}

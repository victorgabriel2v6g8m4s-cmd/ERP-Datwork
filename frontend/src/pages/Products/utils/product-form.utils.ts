import type { MediaItem } from '../../../types/appointment.ts';
import type { Product } from '../../../types/product.ts';
import { PRODUCT_THUMBNAIL_UPLOAD } from '../constants/product-upload.constants.ts';
import type {
    ProductAbcCategory,
    ProductCostInclusion,
    ProductCostPreview,
    ProductFormValidation,
    ProductFormValues,
    ProductMutationPayload
} from '../types/product-form.types.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeNonNegativeNumber(value: unknown, fallback = 0): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function normalizePositiveInteger(value: unknown, fallback = 1): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeAbcCategory(value: unknown): ProductAbcCategory {
    return value === 'A' || value === 'B' || value === 'C' ? value : 'C';
}

function normalizeCostInclusion(value: unknown): ProductCostInclusion {
    return value === 'YES' || value === 'NO' || value === 'DEFAULT' ? value : 'DEFAULT';
}

function normalizeMediaItem(value: unknown): MediaItem | null {
    if (!isRecord(value)) return null;

    const id = typeof value.id === 'string' ? value.id.trim() : '';
    const name = typeof value.name === 'string' ? value.name.trim() : '';
    const url = typeof value.url === 'string' ? value.url.trim() : '';
    const type = value.type;

    if (!id || !name || !url || (type !== 'image' && type !== 'video' && type !== 'document')) {
        return null;
    }

    return { id, name, url, type };
}

export function parseProductMedias(value: unknown): MediaItem[] {
    let parsed = value;

    if (typeof value === 'string') {
        if (!value.trim()) return [];

        try {
            parsed = JSON.parse(value) as unknown;
        } catch {
            return [];
        }
    }

    if (!Array.isArray(parsed)) return [];

    return parsed
        .map(normalizeMediaItem)
        .filter((media): media is MediaItem => media !== null);
}

export function createProductFormValues(product?: Product | null): ProductFormValues {
    if (!product) {
        return {
            sku: '',
            name: '',
            brand: '',
            variation: '',
            description: '',
            recipeCostPerUnit: 0,
            unitsPerBatch: 1,
            indirectCost: 0,
            finalPrice: 0,
            abcCategory: 'C',
            includeFixedCosts: 'DEFAULT',
            thumbnail: null,
            medias: []
        };
    }

    return {
        sku: product.sku ?? '',
        name: product.name ?? '',
        brand: product.brand ?? '',
        variation: product.variation ?? '',
        description: product.description ?? '',
        recipeCostPerUnit: normalizeNonNegativeNumber(product.recipeCostPerUnit),
        unitsPerBatch: normalizePositiveInteger(product.unitsPerBatch),
        indirectCost: normalizeNonNegativeNumber(product.indirectCost),
        finalPrice: normalizeNonNegativeNumber(product.finalPrice),
        abcCategory: normalizeAbcCategory(product.abcCategory),
        includeFixedCosts: normalizeCostInclusion(product.includeFixedCosts),
        thumbnail: typeof product.thumbnail === 'string' && product.thumbnail.trim() ? product.thumbnail : null,
        medias: parseProductMedias(product.medias)
    };
}

export function calculateProductCostPreview(
    values: Pick<ProductFormValues, 'recipeCostPerUnit' | 'unitsPerBatch' | 'indirectCost'>
): ProductCostPreview {
    const recipeCostPerUnit = normalizeNonNegativeNumber(values.recipeCostPerUnit);
    const unitsPerBatch = normalizePositiveInteger(values.unitsPerBatch);
    const indirectCost = normalizeNonNegativeNumber(values.indirectCost);

    return {
        batchRecipeCost: recipeCostPerUnit * unitsPerBatch,
        baseUnitCost: recipeCostPerUnit + indirectCost
    };
}

export function validateProductForm(values: ProductFormValues): ProductFormValidation {
    const errors: ProductFormValidation['errors'] = {};

    if (!values.sku.trim()) errors.sku = 'Informe o SKU do produto.';
    if (!values.name.trim()) errors.name = 'Informe o nome do produto.';

    if (!Number.isFinite(values.indirectCost) || values.indirectCost < 0) {
        errors.indirectCost = 'O custo indireto deve ser um número maior ou igual a zero.';
    }

    if (!Number.isFinite(values.finalPrice) || values.finalPrice < 0) {
        errors.finalPrice = 'O preço final deve ser um número maior ou igual a zero.';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

export function buildProductMutationPayload(values: ProductFormValues): ProductMutationPayload {
    const validation = validateProductForm(values);
    if (!validation.isValid) {
        throw new Error('InvalidProductForm');
    }

    return {
        sku: values.sku.trim().toUpperCase(),
        name: values.name.trim(),
        brand: values.brand.trim() || 'Sem Marca',
        variation: values.variation.trim() || null,
        description: values.description.trim() || null,
        indirectCost: values.indirectCost,
        finalPrice: values.finalPrice,
        abcCategory: values.abcCategory,
        includeFixedCosts: values.includeFixedCosts,
        thumbnail: values.thumbnail,
        medias: values.medias.map((media) => ({ ...media }))
    };
}

export function parseProductSnapshot(value: unknown): Product | null {
    let parsed = value;

    if (typeof value === 'string') {
        try {
            parsed = JSON.parse(value) as unknown;
        } catch {
            return null;
        }
    }

    if (!isRecord(parsed)) return null;

    if (
        typeof parsed.id !== 'string' ||
        typeof parsed.sku !== 'string' ||
        typeof parsed.name !== 'string'
    ) {
        return null;
    }

    return parsed as unknown as Product;
}

export function validateProductThumbnailFile(file: Pick<File, 'type' | 'size'>): string | null {
    if (file.size <= 0) return 'O arquivo de imagem está vazio.';

    if (file.size > PRODUCT_THUMBNAIL_UPLOAD.maxSizeBytes) {
        return 'A imagem de capa deve ter no máximo 5 MB.';
    }

    const acceptedTypes: readonly string[] = PRODUCT_THUMBNAIL_UPLOAD.acceptedMimeTypes;
    if (!acceptedTypes.includes(file.type)) {
        return 'Formato não permitido. Use JPG, PNG ou WEBP.';
    }

    return null;
}

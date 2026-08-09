import type { Product } from '../../../types/product.ts';
import { APP_CONFIG, formatMegabytes } from '../../../config/app.config.ts';
import { TEXTS } from '../../../i18n/index.ts';
import { parseProductResponse } from '../../../utils/productContract.ts';
import type {
    ProductCostPreview,
    ProductFormValidation,
    ProductFormValues,
    ProductMutationPayload
} from '../types/product-form.types.ts';

export { parseProductMedias } from '../../../utils/productContract.ts';

function normalizeNonNegativeNumber(value: unknown, fallback = 0): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function normalizePositiveInteger(value: unknown, fallback = APP_CONFIG.products.defaults.unitsPerBatch): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
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
            unitsPerBatch: APP_CONFIG.products.defaults.unitsPerBatch,
            indirectCost: 0,
            finalPrice: 0,
            abcCategory: APP_CONFIG.products.defaults.abcCategory,
            includeFixedCosts: APP_CONFIG.products.defaults.includeFixedCosts,
            thumbnail: null,
            medias: []
        };
    }

    return {
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        variation: product.variation ?? '',
        description: product.description ?? '',
        recipeCostPerUnit: normalizeNonNegativeNumber(product.recipeCostPerUnit),
        unitsPerBatch: normalizePositiveInteger(product.unitsPerBatch),
        indirectCost: normalizeNonNegativeNumber(product.indirectCost),
        finalPrice: normalizeNonNegativeNumber(product.finalPrice),
        abcCategory: product.abcCategory,
        includeFixedCosts: product.includeFixedCosts,
        thumbnail: product.thumbnail,
        medias: product.medias.map((media) => ({ ...media }))
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

    if (!values.sku.trim()) errors.sku = TEXTS.products.validation.skuRequired;
    if (!values.name.trim()) errors.name = TEXTS.products.validation.nameRequired;

    if (!Number.isFinite(values.indirectCost) || values.indirectCost < 0) {
        errors.indirectCost = TEXTS.products.validation.indirectCostNonNegative;
    }

    if (!Number.isFinite(values.finalPrice) || values.finalPrice < 0) {
        errors.finalPrice = TEXTS.products.validation.finalPriceNonNegative;
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
        brand: values.brand.trim() || APP_CONFIG.products.defaults.brand,
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
    let parsed: unknown = value;

    if (typeof value === 'string') {
        try {
            parsed = JSON.parse(value) as unknown;
        } catch {
            return null;
        }
    }

    return parseProductResponse(parsed, { allowLegacyUnitsPerBatch: true });
}

export function validateProductThumbnailFile(file: Pick<File, 'type' | 'size'>): string | null {
    const thumbnailConfig = APP_CONFIG.uploads.productThumbnail;

    if (file.size <= 0) return TEXTS.uploads.errors.emptyImage;

    if (file.size > thumbnailConfig.maxSizeBytes) {
        return TEXTS.uploads.errors.productThumbnailMaxSize(formatMegabytes(thumbnailConfig.maxSizeBytes));
    }

    const acceptedTypes: readonly string[] = thumbnailConfig.acceptedMimeTypes;
    if (!acceptedTypes.includes(file.type)) {
        return TEXTS.uploads.errors.unsupportedProductThumbnailFormat;
    }

    return null;
}

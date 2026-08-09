import type { Product } from '../../../types/product.ts';
import { parseProductMedias, parseProductResponse } from '../../../utils/productContract.ts';
import { PRODUCT_THUMBNAIL_UPLOAD } from '../constants/product-upload.constants.ts';
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

function normalizePositiveInteger(value: unknown, fallback = 1): number {
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

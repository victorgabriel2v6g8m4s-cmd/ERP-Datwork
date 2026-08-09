import type { MediaItem } from '../../../types/media.ts';
import type {
    ProductAbcCategory,
    ProductCostInclusion,
    ProductMutationInput
} from '../../../types/product.ts';

export type { ProductAbcCategory, ProductCostInclusion } from '../../../types/product.ts';

export interface ProductFormValues {
    sku: string;
    name: string;
    brand: string;
    variation: string;
    description: string;
    recipeCostPerUnit: number;
    unitsPerBatch: number;
    indirectCost: number;
    finalPrice: number;
    abcCategory: ProductAbcCategory;
    includeFixedCosts: ProductCostInclusion;
    thumbnail: string | null;
    medias: MediaItem[];
}

export interface ProductCostPreview {
    batchRecipeCost: number;
    baseUnitCost: number;
}

export type ProductMutationPayload = ProductMutationInput;

export type ProductFormField = 'sku' | 'name' | 'indirectCost' | 'finalPrice';

export interface ProductFormValidation {
    isValid: boolean;
    errors: Partial<Record<ProductFormField, string>>;
}

export interface ProductVersion {
    id: string;
    versionDate: string;
    snapshotData: unknown;
}

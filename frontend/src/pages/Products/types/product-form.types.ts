import type { MediaItem } from '../../../types/appointment.ts';

export type ProductAbcCategory = 'A' | 'B' | 'C';
export type ProductCostInclusion = 'YES' | 'NO' | 'DEFAULT';

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

export interface ProductMutationPayload {
    sku: string;
    name: string;
    brand: string;
    variation: string | null;
    description: string | null;
    indirectCost: number;
    finalPrice: number;
    abcCategory: ProductAbcCategory;
    includeFixedCosts: ProductCostInclusion;
    thumbnail: string | null;
    medias: MediaItem[];
}

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

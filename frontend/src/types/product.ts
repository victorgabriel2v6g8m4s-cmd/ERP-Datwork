import type { MediaItem } from './media.ts';

export type ProductStatus = 'ACTIVE' | 'INACTIVE';
export type ProductAbcCategory = 'A' | 'B' | 'C';
export type ProductCostInclusion = 'YES' | 'NO' | 'DEFAULT';

export interface ProductVersionInfo {
    id: string;
    versionDate: string;
}

/** Contrato de leitura devolvido pela API. */
export interface Product {
    id: string;
    sku: string;
    name: string;
    brand: string;
    variation: string | null;
    description: string | null;
    thumbnail: string | null;
    medias: MediaItem[];
    status: ProductStatus;
    abcCategory: ProductAbcCategory;
    recipeCostPerUnit: number;
    indirectCost: number;
    totalUnitCost: number;
    unitsPerBatch: number;
    suggestedPrice: number;
    finalPrice: number;
    predictedNetProfit: number;
    includeFixedCosts: ProductCostInclusion;
    position: number;
    createdAt: string;
    updatedAt: string;
}

/** Contrato de escrita editável. Custos calculados pelo servidor não pertencem a este tipo. */
export interface ProductMutationInput {
    sku: string;
    name: string;
    brand: string | null;
    variation: string | null;
    description: string | null;
    indirectCost: number;
    finalPrice: number;
    abcCategory: ProductAbcCategory;
    includeFixedCosts: ProductCostInclusion;
    thumbnail: string | null;
    medias: MediaItem[];
}

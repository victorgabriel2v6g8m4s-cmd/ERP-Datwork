import { AbcCategory, CostInclusion, Prisma, ProductStatus } from '@prisma/client';

export type ProductMediaType = 'image' | 'video' | 'document';

export interface ProductMedia {
    id: string;
    name: string;
    url: string;
    type: ProductMediaType;
}

/**
 * Contrato público de leitura de Product.
 * É deliberadamente uma allowlist: relações Prisma e futuras colunas internas
 * não podem vazar para a API apenas por terem sido adicionadas ao schema.
 */
export interface ProductResponse {
    id: string;
    sku: string;
    name: string;
    brand: string;
    variation: string | null;
    description: string | null;
    status: ProductStatus;
    abcCategory: AbcCategory;
    thumbnail: string | null;
    medias: ProductMedia[];
    recipeCostPerUnit: number;
    indirectCost: number;
    totalUnitCost: number;
    unitsPerBatch: number;
    suggestedPrice: number;
    finalPrice: number;
    predictedNetProfit: number;
    includeFixedCosts: CostInclusion;
    position: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductRequest {
    sku: string;
    name: string;
    brand?: string | null;
    variation?: string | null;
    thumbnail?: string | null;
    description?: string | null;
    medias?: Prisma.InputJsonValue;
    indirectCost?: number;
    finalPrice?: number;
    abcCategory?: AbcCategory;
    includeFixedCosts?: CostInclusion;
}

export interface UpdateProductRequest {
    id: string;
    sku?: string;
    name?: string;
    brand?: string | null;
    variation?: string | null;
    description?: string | null;
    thumbnail?: string | null;
    medias?: Prisma.InputJsonValue;
    indirectCost?: number;
    abcCategory?: AbcCategory;
    includeFixedCosts?: CostInclusion;
    finalPrice?: number;
}

export interface ProductVersionInfo {
    id: string;
    versionDate: string;
}

export interface Product {
    id: string;
    sku: string;
    name: string;
    brand?: string;       
    variation?: string;   
    description?: string;
    thumbnail?: string;
    medias?: string;
    status: 'ACTIVE' | 'INACTIVE';
    abcCategory: 'A' | 'B' | 'C' | string;

    // 🧮 Custos e Rateios Hidratados
    recipeCostPerUnit: number;
    indirectCost: number;
    totalUnitCost: number;
    unitsPerBatch: number;
    batchCost: number;
    productionCost: number;

    // 📈 Métricas do Simulador de Margens
    suggestedPrice: number;
    finalPrice: number;
    predictedNetProfit: number;
    includeFixedCosts: 'YES' | 'NO' | 'DEFAULT' | string;

    position: number;
    createdAt: string;
    updatedAt: string;
}

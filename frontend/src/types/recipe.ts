export interface RecipeProductSummary {
    sku: string;
    name: string;
    thumbnail: string | null;
    abcCategory: 'A' | 'B' | 'C';
    recipeCostPerUnit: number;
    indirectCost: number;
    totalUnitCost: number;
}

export interface RecipeIngredientSummary {
    name: string;
    price: number;
    quantity: number;
    unit: string;
}

export interface RecipeItem {
    id: string;
    recipeId: string;
    ingredientId: string;
    quantityNeeded: number;
    ingredient: RecipeIngredientSummary;
}

export interface Recipe {
    id: string;
    productId: string;
    status: 'ACTIVE' | 'INACTIVE';
    position: number;
    unitsPerBatch: number;
    createdAt: string;
    updatedAt: string;
    product: RecipeProductSummary;
    items: RecipeItem[];
}

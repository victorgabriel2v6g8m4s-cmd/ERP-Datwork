import { type Product } from './product.ts';
import { type Ingredient } from './ingredient.ts';

export interface RecipeItem {
    id: string;
    recipeId: string;
    ingredientId: string;
    quantityNeeded: number;
    createdAt: string;
    updatedAt: string;
    ingredient: Ingredient;
}

export interface Recipe {
    id: string;
    productId: string;
    status: 'ACTIVE' | 'INACTIVE';
    position: number;

    // ✨ ADICIONADO: Sincroniza a tipagem com a nova coluna do banco SQLite
    unitsPerBatch: number;

    createdAt: string;
    updatedAt: string;
    product: Product;
    items: RecipeItem[];
}

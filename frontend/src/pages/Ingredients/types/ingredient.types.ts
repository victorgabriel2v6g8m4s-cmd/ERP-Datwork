import type { MediaItem } from '../../../types/media.ts';
import type { Ingredient } from '../../../types/ingredient.ts';

export type IngredientUnit = 'Unidades' | 'Gramas' | 'Quilos' | 'MLs' | 'Centímetros' | 'Metros';
export type IngredientEditorSection = 'id' | 'metrics' | 'media';

export interface IngredientMutationPayload {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  unit: IngredientUnit;
  thumbnail: string | null;
  medias: MediaItem[];
}

export type IngredientFormValues = IngredientMutationPayload;

export interface IngredientOrderPosition {
  id: string;
  position: number;
}

export interface IngredientOrderProfile {
  id: string;
  name: string;
  positions: string;
}

export interface IngredientMetrics {
  totalIngredientsCount: number;
  averagePrice: number;
}

export interface IngredientReorderResult {
  ingredients: Ingredient[];
  positions: IngredientOrderPosition[];
}

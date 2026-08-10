export const INGREDIENT_UNITS = [
  'Unidades',
  'Gramas',
  'Quilos',
  'MLs',
  'Centímetros',
  'Metros'
] as const;

export type IngredientUnit = (typeof INGREDIENT_UNITS)[number];
export type IngredientStatus = 'ACTIVE' | 'INACTIVE';
export type IngredientMediaType = 'image' | 'video' | 'document';

export interface IngredientMediaItem {
  id: string;
  name: string;
  url: string;
  type: IngredientMediaType;
}

export interface IngredientMutationInput {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  unit: IngredientUnit;
  thumbnail: string | null;
  medias: IngredientMediaItem[];
}

export interface IngredientResponse {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  thumbnail: string | null;
  medias: IngredientMediaItem[];
  status: IngredientStatus;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface IngredientVersionResponse {
  id: string;
  versionDate: string;
  snapshotData: unknown;
}

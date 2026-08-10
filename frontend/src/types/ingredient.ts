import type { MediaItem } from './media.ts';

export type IngredientStatus = 'ACTIVE' | 'INACTIVE';

export interface Ingredient {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  thumbnail: string | null;
  medias: MediaItem[];
  status: IngredientStatus;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface IngredientVersion {
  id: string;
  versionDate: string;
  snapshotData: unknown;
}

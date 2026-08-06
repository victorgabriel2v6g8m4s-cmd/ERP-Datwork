export interface IngredientVersionInfo {
  id: string;
  versionDate: string;
}

export interface Ingredient {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  unit: 'Unidades' | 'Gramas' | 'Quilos' | 'MLs' | 'Centímetros' | 'Metros' | string;
  thumbnail?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  position: number;
  createdAt: string;
  updatedAt: string;
  versions?: IngredientVersionInfo[];
}

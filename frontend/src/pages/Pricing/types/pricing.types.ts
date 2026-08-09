import type { Product, ProductCostInclusion } from '../../../types/product.ts';

export interface PricingHeaderMetrics {
  fixedCostPerUnitFactor: number;
  totalVariablePercent: number;
}

export interface PricingOverview extends PricingHeaderMetrics {
  products: Product[];
}

export interface PricingSettings {
  id: string;
  maxProductionCap: number;
  marginCategoryA: number;
  marginCategoryB: number;
  marginCategoryC: number;
  enableAutoABC: boolean;
  updatedAt: string;
}

export interface PricingSettingsMutationPayload {
  maxProductionCap: number;
  marginCategoryA: number;
  marginCategoryB: number;
  marginCategoryC: number;
}

export type PricingProductFieldUpdate =
  | { field: 'finalPrice'; value: number }
  | { field: 'includeFixedCosts'; value: ProductCostInclusion };

export interface PricingProductMutationPayload {
  finalPrice?: number;
  includeFixedCosts?: ProductCostInclusion;
}

export type PricingSyncStatus = 'saved' | 'saving' | 'error';

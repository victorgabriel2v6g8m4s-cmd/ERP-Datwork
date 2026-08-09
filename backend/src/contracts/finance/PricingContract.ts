import { type CostInclusion } from '@prisma/client';
import { type ProductResponse } from '../product/ProductContract.js';

export interface PricingSettingsResponse {
  id: string;
  maxProductionCap: number;
  marginCategoryA: number;
  marginCategoryB: number;
  marginCategoryC: number;
  enableAutoABC: boolean;
  updatedAt: string;
}

export interface PricingSettingsMutationInput {
  maxProductionCap?: number;
  marginCategoryA?: number;
  marginCategoryB?: number;
  marginCategoryC?: number;
  enableAutoABC?: boolean;
}

export interface PricingOverviewResponse {
  fixedCostPerUnitFactor: number;
  totalVariablePercent: number;
  products: ProductResponse[];
}

export interface UpdateProductPricingInput {
  id: string;
  finalPrice?: number;
  includeFixedCosts?: CostInclusion;
}

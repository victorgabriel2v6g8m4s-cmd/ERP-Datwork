import { parseProductList, parseProductResponse } from '../../../utils/productContract.ts';
import type { PricingOverview, PricingSettings } from '../types/pricing.types.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function parseRequiredString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function parsePricingOverviewResponse(value: unknown): PricingOverview | null {
  if (!isRecord(value)) return null;

  const fixedCostPerUnitFactor = parseFiniteNumber(value.fixedCostPerUnitFactor);
  const totalVariablePercent = parseFiniteNumber(value.totalVariablePercent);
  const products = parseProductList(value.products);

  if (fixedCostPerUnitFactor === null || totalVariablePercent === null || products === null) {
    return null;
  }

  return { fixedCostPerUnitFactor, totalVariablePercent, products };
}

export function parsePricingSettingsResponse(value: unknown): PricingSettings | null {
  if (!isRecord(value)) return null;

  const id = parseRequiredString(value.id);
  const maxProductionCap = parseFiniteNumber(value.maxProductionCap);
  const marginCategoryA = parseFiniteNumber(value.marginCategoryA);
  const marginCategoryB = parseFiniteNumber(value.marginCategoryB);
  const marginCategoryC = parseFiniteNumber(value.marginCategoryC);
  const updatedAt = parseRequiredString(value.updatedAt);

  if (
    !id || maxProductionCap === null || marginCategoryA === null || marginCategoryB === null ||
    marginCategoryC === null || typeof value.enableAutoABC !== 'boolean' || !updatedAt
  ) {
    return null;
  }

  return {
    id,
    maxProductionCap,
    marginCategoryA,
    marginCategoryB,
    marginCategoryC,
    enableAutoABC: value.enableAutoABC,
    updatedAt
  };
}

export function parseUpdatedPricingProduct(value: unknown) {
  return parseProductResponse(value);
}

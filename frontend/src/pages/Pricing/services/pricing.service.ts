import { api } from '../../../api/client.ts';
import { APP_CONFIG } from '../../../config/app.config.ts';
import type { Product } from '../../../types/product.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import type {
  PricingOverview,
  PricingProductMutationPayload,
  PricingSettings,
  PricingSettingsMutationPayload
} from '../types/pricing.types.ts';
import {
  parsePricingOverviewResponse,
  parsePricingSettingsResponse,
  parseUpdatedPricingProduct
} from '../utils/pricingContract.ts';

function invalidContract(operation: string): never {
  CustomLogger.error(`[Pricing] Invalid response contract received during ${operation}`);
  throw new Error('InvalidPricingResponseContract');
}

export const pricingService = {
  async getOverview(): Promise<PricingOverview> {
    const response = await api.get<unknown>(APP_CONFIG.api.endpoints.pricing.products);
    return parsePricingOverviewResponse(response.data) ?? invalidContract('overview load');
  },

  async getSettings(): Promise<PricingSettings> {
    const response = await api.get<unknown>(APP_CONFIG.api.endpoints.pricing.settings);
    return parsePricingSettingsResponse(response.data) ?? invalidContract('settings load');
  },

  async updateSettings(payload: PricingSettingsMutationPayload): Promise<PricingSettings> {
    const response = await api.put<unknown>(APP_CONFIG.api.endpoints.pricing.settings, payload);
    return parsePricingSettingsResponse(response.data) ?? invalidContract('settings update');
  },

  async updateProductPricing(id: string, payload: PricingProductMutationPayload): Promise<Product> {
    const endpoint = `${APP_CONFIG.api.endpoints.pricing.products}/${id}`;
    const response = await api.patch<unknown>(endpoint, payload);
    return parseUpdatedPricingProduct(response.data) ?? invalidContract('product pricing update');
  }
};

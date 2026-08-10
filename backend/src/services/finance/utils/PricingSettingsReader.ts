import type { PricingSetting } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export const GLOBAL_PRICING_SETTINGS_ID = 'GLOBAL_CONFIG';

function createDefaultPricingSettings(): PricingSetting {
  return {
    id: GLOBAL_PRICING_SETTINGS_ID,
    maxProductionCap: 1000,
    marginCategoryA: 50,
    marginCategoryB: 30,
    marginCategoryC: 20,
    enableAutoABC: false,
    updatedAt: new Date(0)
  };
}

export async function readPricingSettings(): Promise<PricingSetting> {
  const settings = await prismaClient.pricingSetting.findUnique({
    where: { id: GLOBAL_PRICING_SETTINGS_ID }
  });

  if (settings) return settings;

  CustomLogger.info('[Pricing] Using default settings without persisting a missing singleton');
  return createDefaultPricingSettings();
}

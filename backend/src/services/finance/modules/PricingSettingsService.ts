import { Prisma, type PricingSetting } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type {
  PricingSettingsMutationInput,
  PricingSettingsResponse
} from '../../../contracts/finance/PricingContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import {
  GLOBAL_PRICING_SETTINGS_ID,
  readPricingSettings
} from '../utils/PricingSettingsReader.js';

function presentSettings(settings: PricingSetting): PricingSettingsResponse {
  return {
    id: settings.id,
    maxProductionCap: settings.maxProductionCap,
    marginCategoryA: settings.marginCategoryA,
    marginCategoryB: settings.marginCategoryB,
    marginCategoryC: settings.marginCategoryC,
    enableAutoABC: settings.enableAutoABC,
    updatedAt: settings.updatedAt.toISOString()
  };
}

export class PricingSettingsService {
  async get(): Promise<PricingSettingsResponse> {
    return presentSettings(await readPricingSettings());
  }

  async update(payload: PricingSettingsMutationInput): Promise<PricingSettingsResponse> {
    const updateData: Prisma.PricingSettingUpdateInput = {};
    const createData: Prisma.PricingSettingCreateInput = { id: GLOBAL_PRICING_SETTINGS_ID };

    if (payload.maxProductionCap !== undefined) {
      updateData.maxProductionCap = payload.maxProductionCap;
      createData.maxProductionCap = payload.maxProductionCap;
    }
    if (payload.marginCategoryA !== undefined) {
      updateData.marginCategoryA = payload.marginCategoryA;
      createData.marginCategoryA = payload.marginCategoryA;
    }
    if (payload.marginCategoryB !== undefined) {
      updateData.marginCategoryB = payload.marginCategoryB;
      createData.marginCategoryB = payload.marginCategoryB;
    }
    if (payload.marginCategoryC !== undefined) {
      updateData.marginCategoryC = payload.marginCategoryC;
      createData.marginCategoryC = payload.marginCategoryC;
    }
    if (payload.enableAutoABC !== undefined) {
      updateData.enableAutoABC = payload.enableAutoABC;
      createData.enableAutoABC = payload.enableAutoABC;
    }

    const settings = await prismaClient.pricingSetting.upsert({
      where: { id: GLOBAL_PRICING_SETTINGS_ID },
      create: createData,
      update: updateData
    });

    CustomLogger.info('[Pricing] Global pricing settings updated; recalculating product prices');
    await PricingEngine.recalculateAll();

    return presentSettings(settings);
  }
}

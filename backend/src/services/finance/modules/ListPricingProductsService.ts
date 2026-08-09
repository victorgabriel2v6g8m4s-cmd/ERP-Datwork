import { ExpenseCategory, ProductStatus, ValueType } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type { PricingOverviewResponse } from '../../../contracts/finance/PricingContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { presentProduct } from '../../../presenters/product/ProductPresenter.js';
import { PricingSettingsService } from './PricingSettingsService.js';

export class ListPricingProductsService {
  private readonly settingsService = new PricingSettingsService();

  async execute(): Promise<PricingOverviewResponse> {
    CustomLogger.info('[Pricing] Loading pricing overview');
    await PricingEngine.recalculateAll();

    const settings = await this.settingsService.get();
    const [fixedExpenses, variableExpenses, products] = await Promise.all([
      prismaClient.expense.findMany({
        where: { category: ExpenseCategory.FIXED, status: ProductStatus.ACTIVE },
        select: { value: true }
      }),
      prismaClient.expense.findMany({
        where: {
          category: ExpenseCategory.VARIABLE,
          valueType: ValueType.PERCENT,
          status: ProductStatus.ACTIVE
        },
        select: { value: true }
      }),
      prismaClient.product.findMany({
        where: {
          recipe: { isNot: null },
          status: ProductStatus.ACTIVE
        },
        orderBy: { name: 'asc' },
        include: {
          recipe: { select: { unitsPerBatch: true } }
        }
      })
    ]);

    const totalFixedCost = fixedExpenses.reduce((sum, expense) => sum + expense.value, 0);
    const fixedCostPerUnitFactor = totalFixedCost / Math.max(1, settings.maxProductionCap);
    const totalVariablePercent = variableExpenses.reduce((sum, expense) => sum + expense.value, 0);

    return {
      fixedCostPerUnitFactor,
      totalVariablePercent,
      products: products.map(presentProduct)
    };
  }
}

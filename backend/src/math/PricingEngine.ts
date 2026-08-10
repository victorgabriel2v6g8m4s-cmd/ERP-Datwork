import {
  AbcCategory,
  CostInclusion,
  ExpenseCategory,
  ProductStatus,
  ValueType
} from '@prisma/client';
import prismaClient from '../config/prisma.js';
import { SERVER_CONFIG } from '../config/serverConfig.js';
import { CustomLogger } from '../logger/CustomLogger.js';
import { readPricingSettings } from '../services/finance/utils/PricingSettingsReader.js';

const FLOAT_TOLERANCE = 0.000_001;

interface ProductCostSource {
  indirectCost: number;
  recipe: {
    unitsPerBatch: number;
    items: Array<{
      quantityNeeded: number;
      ingredient: { price: number; quantity: number };
    }>;
  } | null;
}

function calculateRecipeCostPerUnit(product: ProductCostSource): number {
  if (!product.recipe || product.recipe.items.length === 0) return 0;

  const totalIngredientsCost = product.recipe.items.reduce((sum, item) => {
    const availableQuantity = Math.max(item.ingredient.quantity, FLOAT_TOLERANCE);
    return sum + ((item.ingredient.price / availableQuantity) * item.quantityNeeded);
  }, 0);

  return totalIngredientsCost / Math.max(1, product.recipe.unitsPerBatch);
}

function hasFloatChanged(current: number, next: number): boolean {
  return Math.abs(current - next) > FLOAT_TOLERANCE;
}

export class PricingEngine {
  static async recalculateAll(): Promise<void> {
    await this.recalculateProducts();
  }

  static async recalculateProducts(productIds?: readonly string[]): Promise<void> {
    const requestedIds = productIds ? [...new Set(productIds.filter(Boolean))] : undefined;
    if (requestedIds?.length === 0) return;

    CustomLogger.info('[PricingEngine] Starting persisted pricing recalculation', {
      scope: requestedIds ? 'products' : 'all',
      requestedProducts: requestedIds?.length ?? null
    });

    try {
      const settings = await readPricingSettings();

      const effectiveIds = settings.enableAutoABC ? undefined : requestedIds;
      const [fixedExpenses, variableExpenses, products] = await Promise.all([
        prismaClient.expense.aggregate({
          where: { category: ExpenseCategory.FIXED, status: ProductStatus.ACTIVE },
          _sum: { value: true }
        }),
        prismaClient.expense.aggregate({
          where: {
            category: ExpenseCategory.VARIABLE,
            valueType: ValueType.PERCENT,
            status: ProductStatus.ACTIVE
          },
          _sum: { value: true }
        }),
        prismaClient.product.findMany({
          where: {
            status: ProductStatus.ACTIVE,
            ...(effectiveIds ? { id: { in: effectiveIds } } : {})
          },
          include: {
            recipe: {
              include: {
                items: { include: { ingredient: true } }
              }
            }
          }
        })
      ]);

      if (products.length === 0) return;

      const recipeCostByProduct = new Map(
        products.map((product) => [product.id, calculateRecipeCostPerUnit(product)] as const)
      );
      const categoryByProduct = new Map(products.map((product) => [product.id, product.abcCategory] as const));

      if (settings.enableAutoABC) {
        const rankedProducts = products
          .map((product) => ({
            id: product.id,
            totalCostWeight: (recipeCostByProduct.get(product.id) ?? 0) + product.indirectCost
          }))
          .sort((left, right) => right.totalCostWeight - left.totalCostWeight);
        const categoryALimit = Math.ceil(rankedProducts.length * 0.2);
        const categoryBLimit = Math.ceil(rankedProducts.length * 0.5);

        rankedProducts.forEach((product, index) => {
          categoryByProduct.set(
            product.id,
            index < categoryALimit
              ? AbcCategory.A
              : index < categoryBLimit
                ? AbcCategory.B
                : AbcCategory.C
          );
        });
      }

      const fixedCostPerUnit = (fixedExpenses._sum.value ?? 0) / Math.max(1, settings.maxProductionCap);
      const variableMultiplier = Math.max(0.01, 1 - ((variableExpenses._sum.value ?? 0) / 100));

      const updates = products.flatMap((product) => {
        const recipeCostPerUnit = recipeCostByProduct.get(product.id) ?? 0;
        const abcCategory = categoryByProduct.get(product.id) ?? product.abcCategory;
        const totalUnitCost = (recipeCostPerUnit + product.indirectCost) / variableMultiplier;
        const targetMarginPercent = abcCategory === AbcCategory.A
          ? settings.marginCategoryA
          : abcCategory === AbcCategory.B
            ? settings.marginCategoryB
            : settings.marginCategoryC;
        const appliesFixedCost = product.includeFixedCosts === CostInclusion.YES
          || product.includeFixedCosts === CostInclusion.DEFAULT;
        const fixedCostShare = appliesFixedCost ? fixedCostPerUnit : 0;
        const marginMultiplier = Math.max(0.01, 1 - (targetMarginPercent / 100));
        const suggestedPrice = (totalUnitCost + fixedCostShare) / marginMultiplier;
        const activeSellingPrice = product.finalPrice > 0 ? product.finalPrice : suggestedPrice;
        const predictedNetProfit = activeSellingPrice - totalUnitCost - fixedCostShare;

        const changed = product.abcCategory !== abcCategory
          || hasFloatChanged(product.recipeCostPerUnit, recipeCostPerUnit)
          || hasFloatChanged(product.totalUnitCost, totalUnitCost)
          || hasFloatChanged(product.suggestedPrice, suggestedPrice)
          || hasFloatChanged(product.predictedNetProfit, predictedNetProfit);

        return changed
          ? [prismaClient.product.update({
              where: { id: product.id },
              data: {
                abcCategory,
                recipeCostPerUnit,
                totalUnitCost,
                suggestedPrice,
                predictedNetProfit
              }
            })]
          : [];
      });

      for (let index = 0; index < updates.length; index += SERVER_CONFIG.pricing.recalculationBatchSize) {
        await prismaClient.$transaction(
          updates.slice(index, index + SERVER_CONFIG.pricing.recalculationBatchSize)
        );
      }

      CustomLogger.info('[PricingEngine] Pricing recalculation completed', {
        evaluatedProducts: products.length,
        updatedProducts: updates.length,
        autoABC: settings.enableAutoABC
      });
    } catch (error: unknown) {
      CustomLogger.error('[PricingEngine] Pricing recalculation failed', error);
      throw error;
    }
  }
}

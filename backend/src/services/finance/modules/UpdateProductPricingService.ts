import { Prisma } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type { UpdateProductPricingInput } from '../../../contracts/finance/PricingContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { presentProduct } from '../../../presenters/product/ProductPresenter.js';

export class UpdateProductPricingService {
  async execute({ id, finalPrice, includeFixedCosts }: UpdateProductPricingInput) {
    CustomLogger.info(`[Pricing] Updating pricing fields for product ${id}`);

    const updateData: Prisma.ProductUpdateInput = {};
    if (includeFixedCosts !== undefined) updateData.includeFixedCosts = includeFixedCosts;
    if (finalPrice !== undefined) updateData.finalPrice = finalPrice;

    try {
      await prismaClient.product.update({ where: { id }, data: updateData });
      await PricingEngine.recalculateProducts([id]);

      const updated = await prismaClient.product.findUnique({
        where: { id },
        include: { recipe: { select: { unitsPerBatch: true } } }
      });

      if (!updated) throw new Error('ProductNotFoundException');
      return presentProduct(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        CustomLogger.warn(`[Pricing] Product ${id} was not found during pricing update`);
        throw new Error('ProductNotFoundException');
      }

      CustomLogger.error(`[Pricing] Failed to update pricing for product ${id}`, error);
      throw error;
    }
  }
}

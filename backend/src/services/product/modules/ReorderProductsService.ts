import { ProductStatus } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type { ProductPositionInput } from '../../../contracts/product/ProductContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

function hasInvalidPositionShape(positions: readonly ProductPositionInput[]): boolean {
  const ids = new Set<string>();
  const positionValues = new Set<number>();

  for (const item of positions) {
    if (
      typeof item?.id !== 'string' ||
      !item.id.trim() ||
      item.id !== item.id.trim() ||
      !Number.isInteger(item.position) ||
      item.position < 0 ||
      ids.has(item.id) ||
      positionValues.has(item.position)
    ) {
      return true;
    }

    ids.add(item.id);
    positionValues.add(item.position);
  }

  const orderedPositions = [...positionValues].sort((left, right) => left - right);
  return orderedPositions.some((position, index) => position !== index);
}

export class ReorderProductsService {
  async execute(positions: ProductPositionInput[]): Promise<void> {
    if (!Array.isArray(positions) || hasInvalidPositionShape(positions)) {
      throw new Error('ProductReorderMismatch');
    }

    await prismaClient.$transaction(async (tx) => {
      const currentProducts = await tx.product.findMany({
        where: { status: ProductStatus.ACTIVE },
        select: { id: true, position: true }
      });
      const currentIds = new Set(currentProducts.map((product) => product.id));
      const incomingIds = new Set(positions.map((product) => product.id));

      if (
        positions.length !== currentProducts.length ||
        incomingIds.size !== currentIds.size ||
        [...currentIds].some((id) => !incomingIds.has(id))
      ) {
        throw new Error('ProductReorderMismatch');
      }

      const currentPositions = new Map(
        currentProducts.map((product) => [product.id, product.position])
      );
      const changedPositions = positions.filter(
        (product) => currentPositions.get(product.id) !== product.position
      );

      CustomLogger.info(
        `[Products] Persisting ${changedPositions.length} changed positions from ${positions.length} active products`
      );

      for (const product of changedPositions) {
        await tx.product.update({
          where: { id: product.id },
          data: { position: product.position }
        });
      }
    });
  }
}

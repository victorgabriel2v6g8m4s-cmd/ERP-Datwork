import type { Product, Prisma } from '@prisma/client';
import {
  presentProduct,
  type PresentableProduct
} from '../../presenters/product/ProductPresenter.js';

function buildProductSnapshotData(product: PresentableProduct): Prisma.InputJsonObject {
  const snapshot = presentProduct(product);
  const medias: Prisma.InputJsonArray = snapshot.medias.map((media) => ({
    id: media.id,
    name: media.name,
    url: media.url,
    type: media.type
  }));

  return {
    id: snapshot.id,
    sku: snapshot.sku,
    name: snapshot.name,
    brand: snapshot.brand,
    variation: snapshot.variation,
    description: snapshot.description,
    status: snapshot.status,
    abcCategory: snapshot.abcCategory,
    thumbnail: snapshot.thumbnail,
    medias,
    recipeCostPerUnit: snapshot.recipeCostPerUnit,
    indirectCost: snapshot.indirectCost,
    totalUnitCost: snapshot.totalUnitCost,
    unitsPerBatch: snapshot.unitsPerBatch,
    suggestedPrice: snapshot.suggestedPrice,
    finalPrice: snapshot.finalPrice,
    predictedNetProfit: snapshot.predictedNetProfit,
    includeFixedCosts: snapshot.includeFixedCosts,
    position: snapshot.position,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt
  };
}

export async function createProductSnapshot(
  tx: Prisma.TransactionClient,
  product: Product
): Promise<void> {
  const recipe = await tx.recipe.findUnique({
    where: { productId: product.id },
    select: { unitsPerBatch: true }
  });

  await tx.productVersion.create({
    data: {
      productId: product.id,
      snapshotData: buildProductSnapshotData({ ...product, recipe }),
      versionDate: product.updatedAt
    }
  });
}

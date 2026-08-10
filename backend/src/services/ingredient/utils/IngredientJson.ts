import type { Prisma } from '@prisma/client';
import type { IngredientMediaItem, IngredientResponse } from '../../../contracts/ingredient/IngredientContract.js';

export function toIngredientMediaJson(items: IngredientMediaItem[]): Prisma.InputJsonArray {
  return items.map(({ id, name, url, type }) => ({ id, name, url, type }));
}

export function toIngredientSnapshotJson(ingredient: IngredientResponse): Prisma.InputJsonObject {
  return {
    id: ingredient.id,
    sku: ingredient.sku,
    name: ingredient.name,
    price: ingredient.price,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    thumbnail: ingredient.thumbnail,
    medias: toIngredientMediaJson(ingredient.medias),
    status: ingredient.status,
    position: ingredient.position,
    createdAt: ingredient.createdAt,
    updatedAt: ingredient.updatedAt
  };
}

import type { Ingredient } from '@prisma/client';
import type {
  IngredientMediaItem,
  IngredientMediaType,
  IngredientResponse,
  IngredientVersionResponse
} from '../../contracts/ingredient/IngredientContract.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseMediaType(value: unknown): IngredientMediaType | null {
  return value === 'image' || value === 'video' || value === 'document' ? value : null;
}

export function parseStoredIngredientMedias(value: unknown): IngredientMediaItem[] {
  let parsed = value;

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  const medias: IngredientMediaItem[] = [];
  for (const entry of parsed) {
    if (!isRecord(entry)) continue;

    const id = typeof entry.id === 'string' ? entry.id.trim() : '';
    const name = typeof entry.name === 'string' ? entry.name.trim() : '';
    const url = typeof entry.url === 'string' ? entry.url.trim() : '';
    const type = parseMediaType(entry.type);

    if (!id || !name || !url || !type) continue;
    medias.push({ id, name, url, type });
  }

  return medias;
}

export function presentIngredient(ingredient: Ingredient): IngredientResponse {
  return {
    id: ingredient.id,
    sku: ingredient.sku,
    name: ingredient.name,
    price: ingredient.price,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    thumbnail: ingredient.thumbnail,
    medias: parseStoredIngredientMedias(ingredient.medias),
    status: ingredient.status,
    position: ingredient.position,
    createdAt: ingredient.createdAt.toISOString(),
    updatedAt: ingredient.updatedAt.toISOString()
  };
}

export function presentIngredientVersion(version: {
  id: string;
  versionDate: Date;
  snapshotData: unknown;
}): IngredientVersionResponse {
  return {
    id: version.id,
    versionDate: version.versionDate.toISOString(),
    snapshotData: version.snapshotData
  };
}

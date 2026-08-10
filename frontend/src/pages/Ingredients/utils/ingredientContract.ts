import type { MediaItem, MediaType } from '../../../types/media.ts';
import type { Ingredient, IngredientVersion } from '../../../types/ingredient.ts';
import type { IngredientOrderPosition, IngredientOrderProfile } from '../types/ingredient.types.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function nullableText(value: unknown): string | null | undefined {
  if (value === null || value === undefined || value === '') return null;
  return typeof value === 'string' ? value.trim() || null : undefined;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function mediaType(value: unknown): MediaType | null {
  return value === 'image' || value === 'video' || value === 'document' ? value : null;
}

export function parseIngredientMedias(value: unknown): MediaItem[] | null {
  let parsed = value;

  if (parsed === null || parsed === undefined || parsed === '') return [];
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return null;
    }
  }

  if (!Array.isArray(parsed)) return null;

  const medias: MediaItem[] = [];
  const ids = new Set<string>();
  for (const entry of parsed) {
    if (!isRecord(entry)) return null;

    const id = requiredText(entry.id);
    const name = requiredText(entry.name);
    const url = requiredText(entry.url);
    const type = mediaType(entry.type);

    if (!id || !name || !url || !type || ids.has(id)) return null;
    ids.add(id);
    medias.push({ id, name, url, type });
  }

  return medias;
}

export function parseIngredientResponse(value: unknown): Ingredient | null {
  if (!isRecord(value)) return null;

  const id = requiredText(value.id);
  const sku = requiredText(value.sku);
  const name = requiredText(value.name);
  const price = finiteNumber(value.price);
  const quantity = finiteNumber(value.quantity);
  const unit = requiredText(value.unit);
  const thumbnail = nullableText(value.thumbnail);
  const medias = parseIngredientMedias(value.medias);
  const status = value.status === 'ACTIVE' || value.status === 'INACTIVE' ? value.status : null;
  const position = finiteNumber(value.position);
  const createdAt = requiredText(value.createdAt);
  const updatedAt = requiredText(value.updatedAt);

  if (
    !id || !sku || !name || price === null || price < 0 || quantity === null || quantity < 0 || !unit ||
    thumbnail === undefined || medias === null || !status || position === null || !Number.isInteger(position) || position < 0 ||
    !createdAt || !updatedAt
  ) {
    return null;
  }

  return { id, sku, name, price, quantity, unit, thumbnail, medias, status, position, createdAt, updatedAt };
}

export function parseIngredientList(value: unknown): Ingredient[] | null {
  if (!Array.isArray(value)) return null;
  const ingredients: Ingredient[] = [];
  for (const entry of value) {
    const ingredient = parseIngredientResponse(entry);
    if (!ingredient) return null;
    ingredients.push(ingredient);
  }
  return ingredients;
}

export function parseIngredientSnapshot(value: unknown): Ingredient | null {
  let parsed = value;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return null;
    }
  }
  return parseIngredientResponse(parsed);
}

export function parseIngredientVersions(value: unknown): IngredientVersion[] | null {
  if (!Array.isArray(value)) return null;

  const versions: IngredientVersion[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) return null;
    const id = requiredText(entry.id);
    const versionDate = requiredText(entry.versionDate);
    if (!id || !versionDate || !('snapshotData' in entry)) return null;
    versions.push({ id, versionDate, snapshotData: entry.snapshotData });
  }
  return versions;
}

export function parseIngredientOrderPositions(value: unknown): IngredientOrderPosition[] {
  let parsed = value;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];
  const ids = new Set<string>();
  const positions: IngredientOrderPosition[] = [];

  for (const entry of parsed) {
    if (!isRecord(entry)) continue;
    const id = requiredText(entry.id);
    const position = finiteNumber(entry.position);
    if (!id || position === null || !Number.isInteger(position) || position < 0 || ids.has(id)) continue;
    ids.add(id);
    positions.push({ id, position });
  }

  return positions;
}

export function parseIngredientOrderProfiles(value: unknown): IngredientOrderProfile[] | null {
  if (!Array.isArray(value)) return null;
  const profiles: IngredientOrderProfile[] = [];

  for (const entry of value) {
    if (!isRecord(entry)) return null;
    const id = requiredText(entry.id);
    const name = requiredText(entry.name);
    if (!id || !name) return null;
    profiles.push({ id, name, positions: JSON.stringify(parseIngredientOrderPositions(entry.positions)) });
  }

  return profiles;
}

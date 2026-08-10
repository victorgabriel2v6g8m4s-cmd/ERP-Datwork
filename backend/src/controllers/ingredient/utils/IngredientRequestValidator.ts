import {
  INGREDIENT_UNITS,
  type IngredientMediaItem,
  type IngredientMediaType,
  type IngredientMutationInput,
  type IngredientStatus
} from '../../../contracts/ingredient/IngredientContract.js';
import type { ScopedOrderPosition } from '../../../services/orderProfile/ScopedOrderProfileService.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseRequiredText(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error('InvalidIngredientPayload');
  return value.trim();
}

function parseFiniteNumber(value: unknown, minimum: number): number {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && value.trim()
      ? Number(value)
      : Number.NaN;

  if (!Number.isFinite(parsed) || parsed < minimum) throw new Error('InvalidIngredientPayload');
  return parsed;
}

function parseMediaType(value: unknown): IngredientMediaType {
  if (value === 'image' || value === 'video' || value === 'document') return value;
  throw new Error('InvalidIngredientPayload');
}

function parseMedias(value: unknown): IngredientMediaItem[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) throw new Error('InvalidIngredientPayload');

  const ids = new Set<string>();
  return value.map((entry) => {
    if (!isRecord(entry)) throw new Error('InvalidIngredientPayload');

    const id = parseRequiredText(entry.id);
    if (ids.has(id)) throw new Error('InvalidIngredientPayload');
    ids.add(id);

    return {
      id,
      name: parseRequiredText(entry.name),
      url: parseRequiredText(entry.url),
      type: parseMediaType(entry.type)
    };
  });
}

export function parseIngredientMutation(value: unknown): IngredientMutationInput {
  if (!isRecord(value)) throw new Error('InvalidIngredientPayload');

  const unit = parseRequiredText(value.unit);
  if (!INGREDIENT_UNITS.includes(unit as (typeof INGREDIENT_UNITS)[number])) {
    throw new Error('InvalidIngredientPayload');
  }

  let thumbnail: string | null = null;
  if (value.thumbnail !== undefined && value.thumbnail !== null) {
    if (typeof value.thumbnail !== 'string') throw new Error('InvalidIngredientPayload');
    thumbnail = value.thumbnail.trim() || null;
  }

  return {
    sku: parseRequiredText(value.sku).toUpperCase(),
    name: parseRequiredText(value.name),
    price: parseFiniteNumber(value.price, 0),
    quantity: parseFiniteNumber(value.quantity, 0.01),
    unit: unit as IngredientMutationInput['unit'],
    thumbnail,
    medias: parseMedias(value.medias)
  };
}

export function parseIngredientStatus(value: unknown): IngredientStatus {
  if (!isRecord(value) || (value.status !== 'ACTIVE' && value.status !== 'INACTIVE')) {
    throw new Error('InvalidIngredientStatus');
  }
  return value.status;
}

export function parseIngredientId(value: unknown): string {
  return parseRequiredText(value);
}

export function parseOrderProfileName(value: unknown): string {
  if (!isRecord(value)) throw new Error('InvalidOrderProfilePayload');
  const name = parseRequiredText(value.name);
  if (name.length > 120) throw new Error('InvalidOrderProfilePayload');
  return name;
}

export function parseOrderPositions(value: unknown): ScopedOrderPosition[] {
  if (!isRecord(value) || !Array.isArray(value.positions)) throw new Error('InvalidOrderPositions');

  const ids = new Set<string>();
  const positions = new Set<number>();
  const parsed = value.positions.map((entry) => {
    if (!isRecord(entry)) throw new Error('InvalidOrderPositions');
    const id = parseRequiredText(entry.id);
    const position = parseFiniteNumber(entry.position, 0);

    if (!Number.isInteger(position) || ids.has(id) || positions.has(position)) {
      throw new Error('InvalidOrderPositions');
    }

    ids.add(id);
    positions.add(position);
    return { id, position };
  });

  const sortedPositions = [...positions].sort((a, b) => a - b);
  if (sortedPositions.some((position, index) => position !== index)) {
    throw new Error('InvalidOrderPositions');
  }

  return parsed;
}

import type {
  CreateRecipeInput,
  RecipeIngredientMutationInput,
  RecipePositionInput,
  RecipeStatus,
  UpdateRecipeInput
} from '../../../contracts/recipe/RecipeContract.js';

export class RecipeRequestValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message);
    this.name = 'RecipeRequestValidationError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseRequiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new RecipeRequestValidationError(field, `O campo ${field} deve ser um texto válido.`);
  }
  return value.trim();
}

function parseNumber(value: unknown, field: string): number {
  if (typeof value === 'string' && !value.trim()) {
    throw new RecipeRequestValidationError(field, `O campo ${field} deve ser numérico.`);
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new RecipeRequestValidationError(field, `O campo ${field} deve ser um número finito.`);
  }
  return parsed;
}

function parseUnitsPerBatch(value: unknown): number {
  const unitsPerBatch = parseNumber(value, 'unitsPerBatch');
  if (!Number.isInteger(unitsPerBatch) || unitsPerBatch < 1) {
    throw new RecipeRequestValidationError('unitsPerBatch', 'O rendimento por lote deve ser um inteiro maior ou igual a 1.');
  }
  return unitsPerBatch;
}

function parseIngredients(value: unknown): RecipeIngredientMutationInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new RecipeRequestValidationError('ingredients', 'A receita deve possuir ao menos um insumo.');
  }

  const ingredientIds = new Set<string>();
  return value.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new RecipeRequestValidationError(`ingredients.${index}`, 'O insumo informado é inválido.');
    }

    const ingredientId = parseRequiredText(entry.ingredientId, `ingredients.${index}.ingredientId`);
    const quantityNeeded = parseNumber(entry.quantityNeeded, `ingredients.${index}.quantityNeeded`);

    if (quantityNeeded <= 0) {
      throw new RecipeRequestValidationError(
        `ingredients.${index}.quantityNeeded`,
        'A quantidade utilizada deve ser maior que zero.'
      );
    }
    if (ingredientIds.has(ingredientId)) {
      throw new RecipeRequestValidationError('ingredients', 'A receita não pode repetir o mesmo insumo.');
    }

    ingredientIds.add(ingredientId);
    return { ingredientId, quantityNeeded };
  });
}

function parseMutation(value: unknown) {
  if (!isRecord(value)) {
    throw new RecipeRequestValidationError('body', 'O corpo da requisição é inválido.');
  }

  return {
    unitsPerBatch: parseUnitsPerBatch(value.unitsPerBatch),
    ingredients: parseIngredients(value.ingredients)
  };
}

export function parseRecipeId(value: unknown): string {
  return parseRequiredText(value, 'id');
}

export function parseRecipeCreate(value: unknown): CreateRecipeInput {
  if (!isRecord(value)) {
    throw new RecipeRequestValidationError('body', 'O corpo da requisição é inválido.');
  }

  return {
    productId: parseRequiredText(value.productId, 'productId'),
    ...parseMutation(value)
  };
}

export function parseRecipeUpdate(id: unknown, value: unknown): UpdateRecipeInput {
  return {
    id: parseRecipeId(id),
    ...parseMutation(value)
  };
}

export function parseRecipeStatus(value: unknown): RecipeStatus {
  if (!isRecord(value) || (value.status !== 'ACTIVE' && value.status !== 'INACTIVE')) {
    throw new RecipeRequestValidationError('status', 'O status deve ser ACTIVE ou INACTIVE.');
  }
  return value.status;
}

export function parseRecipePositions(value: unknown): RecipePositionInput[] {
  if (!isRecord(value) || !Array.isArray(value.positions) || value.positions.length === 0) {
    throw new RecipeRequestValidationError('positions', 'A ordenação deve possuir ao menos uma posição.');
  }

  const ids = new Set<string>();
  const positions = new Set<number>();
  const parsed = value.positions.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new RecipeRequestValidationError(`positions.${index}`, 'A posição informada é inválida.');
    }

    const id = parseRequiredText(entry.id, `positions.${index}.id`);
    const position = parseNumber(entry.position, `positions.${index}.position`);
    if (!Number.isInteger(position) || position < 0 || ids.has(id) || positions.has(position)) {
      throw new RecipeRequestValidationError('positions', 'IDs e posições devem ser únicos, inteiros e não negativos.');
    }

    ids.add(id);
    positions.add(position);
    return { id, position };
  });

  const sortedPositions = [...positions].sort((a, b) => a - b);
  if (sortedPositions.some((position, index) => position !== index)) {
    throw new RecipeRequestValidationError('positions', 'As posições devem formar uma sequência contínua iniciada em zero.');
  }

  return parsed;
}

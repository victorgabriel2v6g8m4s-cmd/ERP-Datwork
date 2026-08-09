import { CostInclusion } from '@prisma/client';
import type {
  PricingSettingsMutationInput,
  UpdateProductPricingInput
} from '../../../contracts/finance/PricingContract.js';

export class PricingRequestValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message);
    this.name = 'PricingRequestValidationError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseNumberInRange(
  value: unknown,
  field: string,
  minimum: number,
  maximum?: number
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string' && !value.trim()) {
    throw new PricingRequestValidationError(field, `O campo ${field} deve ser um número válido.`);
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < minimum || (maximum !== undefined && parsed > maximum)) {
    const range = maximum === undefined ? `maior ou igual a ${minimum}` : `entre ${minimum} e ${maximum}`;
    throw new PricingRequestValidationError(field, `O campo ${field} deve ser um número ${range}.`);
  }

  return parsed;
}

function parseOptionalBoolean(value: unknown, field: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') {
    throw new PricingRequestValidationError(field, `O campo ${field} deve ser booleano.`);
  }
  return value;
}

function parseOptionalCostInclusion(value: unknown): CostInclusion | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !Object.values(CostInclusion).includes(value as CostInclusion)) {
    throw new PricingRequestValidationError('includeFixedCosts', 'A configuração de custos fixos informada é inválida.');
  }
  return value as CostInclusion;
}

export function parsePricingSettingsMutation(value: unknown): PricingSettingsMutationInput {
  if (!isRecord(value)) {
    throw new PricingRequestValidationError('body', 'O corpo da requisição de ajustes é inválido.');
  }

  const payload: PricingSettingsMutationInput = {};
  const maxProductionCap = parseNumberInRange(value.maxProductionCap, 'maxProductionCap', 1);
  const marginCategoryA = parseNumberInRange(value.marginCategoryA, 'marginCategoryA', 0, 100);
  const marginCategoryB = parseNumberInRange(value.marginCategoryB, 'marginCategoryB', 0, 100);
  const marginCategoryC = parseNumberInRange(value.marginCategoryC, 'marginCategoryC', 0, 100);
  const enableAutoABC = parseOptionalBoolean(value.enableAutoABC, 'enableAutoABC');

  if (maxProductionCap !== undefined) payload.maxProductionCap = maxProductionCap;
  if (marginCategoryA !== undefined) payload.marginCategoryA = marginCategoryA;
  if (marginCategoryB !== undefined) payload.marginCategoryB = marginCategoryB;
  if (marginCategoryC !== undefined) payload.marginCategoryC = marginCategoryC;
  if (enableAutoABC !== undefined) payload.enableAutoABC = enableAutoABC;

  if (Object.keys(payload).length === 0) {
    throw new PricingRequestValidationError('body', 'Informe ao menos um ajuste de precificação para atualizar.');
  }

  return payload;
}

export function parseProductPricingMutation(id: unknown, value: unknown): UpdateProductPricingInput {
  if (typeof id !== 'string' || !id.trim()) {
    throw new PricingRequestValidationError('id', 'O parâmetro ID do produto é obrigatório e deve ser um texto válido.');
  }
  if (!isRecord(value)) {
    throw new PricingRequestValidationError('body', 'O corpo da requisição de precificação é inválido.');
  }

  const payload: UpdateProductPricingInput = { id: id.trim() };
  const finalPrice = parseNumberInRange(value.finalPrice, 'finalPrice', 0);
  const includeFixedCosts = parseOptionalCostInclusion(value.includeFixedCosts);

  if (finalPrice !== undefined) payload.finalPrice = finalPrice;
  if (includeFixedCosts !== undefined) payload.includeFixedCosts = includeFixedCosts;

  if (finalPrice === undefined && includeFixedCosts === undefined) {
    throw new PricingRequestValidationError('body', 'Informe finalPrice ou includeFixedCosts para atualizar a precificação.');
  }

  return payload;
}

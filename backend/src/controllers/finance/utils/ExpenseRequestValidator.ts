import type {
  ExpenseCategory,
  ExpenseMutationInput,
  ExpenseStatus,
  ExpenseValueType
} from '../../../contracts/finance/ExpenseContract.js';

export class ExpenseRequestValidationError extends Error {
  constructor(
    public readonly field: string,
    message: string
  ) {
    super(message);
    this.name = 'ExpenseRequestValidationError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseRequiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ExpenseRequestValidationError(field, `O campo ${field} é obrigatório e deve ser um texto válido.`);
  }
  return value.trim();
}

function parseNonNegativeNumber(value: unknown, field: string): number {
  if (typeof value === 'string' && !value.trim()) {
    throw new ExpenseRequestValidationError(field, `O campo ${field} deve ser um número válido.`);
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ExpenseRequestValidationError(field, `O campo ${field} deve ser um número maior ou igual a zero.`);
  }
  return parsed;
}

function parseValueType(value: unknown, field: string): ExpenseValueType {
  if (value === 'LITERAL' || value === 'PERCENT') return value;
  throw new ExpenseRequestValidationError(field, `O campo ${field} deve ser LITERAL ou PERCENT.`);
}

function parseCategory(value: unknown, field: string): ExpenseCategory {
  if (value === 'FIXED' || value === 'VARIABLE') return value;
  throw new ExpenseRequestValidationError(field, `O campo ${field} deve ser FIXED ou VARIABLE.`);
}

function parseStatus(value: unknown, field: string): ExpenseStatus {
  if (value === 'ACTIVE' || value === 'INACTIVE') return value;
  throw new ExpenseRequestValidationError(field, `O campo ${field} deve ser ACTIVE ou INACTIVE.`);
}

export function parseExpenseMutationList(value: unknown): ExpenseMutationInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ExpenseRequestValidationError('expenses', 'O payload de despesas deve ser um array não vazio.');
  }

  const ids = new Set<string>();

  return value.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new ExpenseRequestValidationError(`expenses[${index}]`, 'A despesa possui estrutura inválida.');
    }

    const id = entry.id === undefined ? undefined : parseRequiredString(entry.id, `expenses[${index}].id`);
    if (id && ids.has(id)) {
      throw new ExpenseRequestValidationError(`expenses[${index}].id`, 'O payload contém IDs de despesas duplicados.');
    }
    if (id) ids.add(id);

    const parsed: ExpenseMutationInput = {
      name: parseRequiredString(entry.name, `expenses[${index}].name`),
      value: parseNonNegativeNumber(entry.value, `expenses[${index}].value`),
      valueType: parseValueType(entry.valueType, `expenses[${index}].valueType`),
      category: parseCategory(entry.category, `expenses[${index}].category`)
    };

    if (id) parsed.id = id;
    return parsed;
  });
}

export function parseExpenseStatusMutation(value: unknown): ExpenseStatus {
  if (!isRecord(value)) {
    throw new ExpenseRequestValidationError('body', 'O payload de status deve ser um objeto válido.');
  }
  return parseStatus(value.status, 'status');
}

export function parseExpenseId(value: unknown, field = 'id'): string {
  return parseRequiredString(value, field);
}

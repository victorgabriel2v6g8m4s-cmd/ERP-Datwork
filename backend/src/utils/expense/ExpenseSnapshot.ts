import { Prisma, type Expense } from '@prisma/client';
import type {
  ExpenseCategory,
  ExpenseResponse,
  ExpenseStatus,
  ExpenseValueType
} from '../../contracts/finance/ExpenseContract.js';

export class ExpenseSnapshotValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpenseSnapshotValidationError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function nonNegativeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function valueType(value: unknown): ExpenseValueType | null {
  return value === 'LITERAL' || value === 'PERCENT' ? value : null;
}

function category(value: unknown): ExpenseCategory | null {
  return value === 'FIXED' || value === 'VARIABLE' ? value : null;
}

function status(value: unknown): ExpenseStatus | null {
  return value === 'ACTIVE' || value === 'INACTIVE' ? value : null;
}

function position(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}

function dateString(value: unknown): string | null {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null;
}

export function buildExpenseSnapshotData(expenses: Expense[]): Prisma.InputJsonValue {
  return expenses.map((expense) => ({
    id: expense.id,
    name: expense.name,
    value: expense.value,
    valueType: expense.valueType,
    category: expense.category,
    status: expense.status,
    position: expense.position,
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString()
  }));
}

export function parseStoredExpenseSnapshot(value: unknown): ExpenseResponse[] {
  let parsed: unknown = value;

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      throw new ExpenseSnapshotValidationError('O snapshot armazenado contém JSON inválido.');
    }
  }

  if (!Array.isArray(parsed)) {
    throw new ExpenseSnapshotValidationError('O snapshot armazenado deve ser um array válido.');
  }

  const ids = new Set<string>();

  return parsed.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new ExpenseSnapshotValidationError(`A despesa na posição ${index} possui estrutura inválida.`);
    }

    const parsedId = requiredString(entry.id);
    const parsedName = typeof entry.name === 'string' ? entry.name : null;
    const parsedValue = nonNegativeNumber(entry.value);
    const parsedValueType = valueType(entry.valueType);
    const parsedCategory = category(entry.category);
    const parsedStatus = status(entry.status);
    const parsedPosition = position(entry.position);
    const createdAt = dateString(entry.createdAt);
    const updatedAt = dateString(entry.updatedAt);

    if (
      !parsedId || parsedName === null || parsedValue === null || !parsedValueType ||
      !parsedCategory || !parsedStatus || parsedPosition === null || !createdAt || !updatedAt
    ) {
      throw new ExpenseSnapshotValidationError(`A despesa na posição ${index} possui contrato inválido.`);
    }

    if (ids.has(parsedId)) {
      throw new ExpenseSnapshotValidationError(`O snapshot contém o ID duplicado ${parsedId}.`);
    }
    ids.add(parsedId);

    return {
      id: parsedId,
      name: parsedName,
      value: parsedValue,
      valueType: parsedValueType,
      category: parsedCategory,
      status: parsedStatus,
      position: parsedPosition,
      createdAt,
      updatedAt
    };
  });
}

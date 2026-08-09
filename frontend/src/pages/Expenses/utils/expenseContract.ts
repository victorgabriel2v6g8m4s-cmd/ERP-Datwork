import type {
  Expense,
  ExpenseCategory,
  ExpensesOverview,
  ExpenseStatus,
  ExpenseValueType,
  ExpenseVersion
} from '../../../types/expense.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseRequiredString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function parseFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function parsePosition(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}

function parseValueType(value: unknown): ExpenseValueType | null {
  return value === 'LITERAL' || value === 'PERCENT' ? value : null;
}

function parseCategory(value: unknown): ExpenseCategory | null {
  return value === 'FIXED' || value === 'VARIABLE' ? value : null;
}

function parseStatus(value: unknown): ExpenseStatus | null {
  return value === 'ACTIVE' || value === 'INACTIVE' ? value : null;
}

function parseDate(value: unknown): string | null {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null;
}

export function parseExpenseResponse(value: unknown): Expense | null {
  if (!isRecord(value)) return null;

  const id = parseRequiredString(value.id);
  const name = typeof value.name === 'string' ? value.name : null;
  const amount = parseFiniteNumber(value.value);
  const valueType = parseValueType(value.valueType);
  const category = parseCategory(value.category);
  const status = parseStatus(value.status);
  const position = parsePosition(value.position);
  const createdAt = parseDate(value.createdAt);
  const updatedAt = parseDate(value.updatedAt);

  if (!id || name === null || amount === null || !valueType || !category || !status || position === null || !createdAt || !updatedAt) {
    return null;
  }

  return {
    id,
    name,
    value: amount,
    valueType,
    category,
    status,
    position,
    createdAt,
    updatedAt
  };
}

export function parseExpenseList(value: unknown): Expense[] | null {
  if (!Array.isArray(value)) return null;

  const expenses: Expense[] = [];
  for (const entry of value) {
    const parsed = parseExpenseResponse(entry);
    if (!parsed) return null;
    expenses.push(parsed);
  }
  return expenses;
}

export function parseExpensesOverviewResponse(value: unknown): ExpensesOverview | null {
  if (!isRecord(value)) return null;

  const expenses = parseExpenseList(value.expenses);
  const fixedCostPerUnitFactor = parseFiniteNumber(value.fixedCostPerUnitFactor);
  const totalVariablePercent = parseFiniteNumber(value.totalVariablePercent);

  if (!expenses || fixedCostPerUnitFactor === null || totalVariablePercent === null) return null;

  return { expenses, fixedCostPerUnitFactor, totalVariablePercent };
}

function parseSnapshot(value: unknown): Expense[] | null {
  let parsed = value;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return null;
    }
  }
  return parseExpenseList(parsed);
}

export function parseExpenseVersionResponse(value: unknown): ExpenseVersion | null {
  if (!isRecord(value)) return null;

  const id = parseRequiredString(value.id);
  const versionDate = parseDate(value.versionDate);
  const snapshotData = parseSnapshot(value.snapshotData);

  if (!id || !versionDate || !snapshotData) return null;
  return { id, versionDate, snapshotData };
}

export function parseExpenseVersionsResponse(value: unknown): ExpenseVersion[] | null {
  if (!Array.isArray(value)) return null;

  const versions: ExpenseVersion[] = [];
  for (const entry of value) {
    const parsed = parseExpenseVersionResponse(entry);
    if (!parsed) return null;
    versions.push(parsed);
  }
  return versions;
}

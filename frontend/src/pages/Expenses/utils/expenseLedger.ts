import type {
  Expense,
  ExpenseCategory,
  ExpenseMutationInput
} from '../../../types/expense.ts';
import type { UniversalFilters } from '../../../components/UniversalSearchBar.tsx';
import type { ExpenseEditableUpdate } from '../types/expenses.types.ts';

export function createBlankExpense(id: string, category: ExpenseCategory, position: number): Expense {
  const now = new Date().toISOString();
  return {
    id,
    name: '',
    value: 0,
    valueType: 'LITERAL',
    category,
    status: 'ACTIVE',
    position,
    createdAt: now,
    updatedAt: now
  };
}

export function applyExpenseUpdate(
  expenses: Expense[],
  id: string,
  update: ExpenseEditableUpdate
): Expense[] {
  return expenses.map((expense) => {
    if (expense.id !== id) return expense;
    if (update.field === 'name') return { ...expense, name: update.value };
    if (update.field === 'value') return { ...expense, value: update.value };
    return { ...expense, valueType: update.value };
  });
}

export function buildExpenseMutationPayload(expenses: Expense[]): ExpenseMutationInput[] {
  return expenses
    .filter((expense) => expense.status === 'ACTIVE' && expense.name.trim())
    .map((expense) => {
      const payload: ExpenseMutationInput = {
        name: expense.name.trim(),
        value: Number(expense.value),
        valueType: expense.valueType,
        category: expense.category
      };

      if (!expense.id.startsWith('temp-')) payload.id = expense.id;
      return payload;
    });
}

export function serializeExpensePayload(payload: ExpenseMutationInput[]): string {
  return JSON.stringify(payload);
}

export function getExpenseCategoryTotal(expenses: Expense[], category: ExpenseCategory): number {
  return expenses
    .filter((expense) => expense.category === category && expense.status === 'ACTIVE' && expense.valueType === 'LITERAL')
    .reduce((total, expense) => total + expense.value, 0);
}

export function getExpenseRepresentationPercent(expense: Expense, categoryTotal: number): number {
  if (expense.valueType === 'PERCENT') return expense.value;
  if (categoryTotal <= 0) return 0;
  return (expense.value / categoryTotal) * 100;
}

export function filterAndSortExpenses(
  expenses: Expense[],
  category: ExpenseCategory,
  filters: UniversalFilters
): Expense[] {
  const search = filters.search.trim().toLocaleLowerCase();
  const result = expenses.filter((expense) => (
    expense.category === category &&
    expense.status === 'ACTIVE' &&
    (!search || expense.name.toLocaleLowerCase().includes(search))
  ));

  if (filters.sortBy === 'az') {
    return [...result].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (filters.sortBy === 'value') {
    return [...result].sort((a, b) => b.value - a.value);
  }
  if (filters.sortBy === 'date') {
    return [...result].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }
  return [...result].sort((a, b) => a.position - b.position);
}

import type { Expense } from '@prisma/client';
import type { ExpenseResponse } from '../../contracts/finance/ExpenseContract.js';

export function presentExpense(expense: Expense): ExpenseResponse {
  return {
    id: expense.id,
    name: expense.name,
    value: expense.value,
    valueType: expense.valueType,
    category: expense.category,
    status: expense.status,
    position: expense.position,
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString()
  };
}

export function presentExpenseList(expenses: Expense[]): ExpenseResponse[] {
  return expenses.map(presentExpense);
}

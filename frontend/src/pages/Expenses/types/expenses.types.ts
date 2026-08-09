import type { ExpenseValueType } from '../../../types/expense.ts';

export type ExpensesSyncStatus = 'saved' | 'saving' | 'error';

export type ExpenseEditableUpdate =
  | { field: 'name'; value: string }
  | { field: 'value'; value: number }
  | { field: 'valueType'; value: ExpenseValueType };

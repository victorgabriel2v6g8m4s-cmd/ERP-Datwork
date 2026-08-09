export type ExpenseValueType = 'LITERAL' | 'PERCENT';
export type ExpenseCategory = 'FIXED' | 'VARIABLE';
export type ExpenseStatus = 'ACTIVE' | 'INACTIVE';

export interface ExpenseResponse {
  id: string;
  name: string;
  value: number;
  valueType: ExpenseValueType;
  category: ExpenseCategory;
  status: ExpenseStatus;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseMutationInput {
  id?: string;
  name: string;
  value: number;
  valueType: ExpenseValueType;
  category: ExpenseCategory;
}

export interface ExpenseMetricsResponse {
  fixedCostPerUnitFactor: number;
  totalVariablePercent: number;
}

export interface ExpensesOverviewResponse extends ExpenseMetricsResponse {
  expenses: ExpenseResponse[];
}

export interface ExpenseVersionResponse {
  id: string;
  snapshotData: ExpenseResponse[];
  versionDate: string;
}

import { api } from '../../../api/client.ts';
import { APP_CONFIG } from '../../../config/app.config.ts';
import type {
  ExpenseMutationInput,
  ExpensesOverview,
  ExpenseStatus,
  ExpenseVersion
} from '../../../types/expense.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import {
  parseExpensesOverviewResponse,
  parseExpenseVersionsResponse
} from '../utils/expenseContract.ts';

function invalidContract(operation: string): never {
  CustomLogger.error(`[Expenses] Invalid response contract received during ${operation}`);
  throw new Error('InvalidExpensesResponseContract');
}

export const expensesService = {
  async getOverview(): Promise<ExpensesOverview> {
    const response = await api.get<unknown>(APP_CONFIG.api.endpoints.expenses.overview);
    return parseExpensesOverviewResponse(response.data) ?? invalidContract('overview load');
  },

  async save(expenses: ExpenseMutationInput[]): Promise<ExpensesOverview> {
    const response = await api.post<unknown>(APP_CONFIG.api.endpoints.expenses.overview, { expenses });
    return parseExpensesOverviewResponse(response.data) ?? invalidContract('ledger save');
  },

  async updateStatus(id: string, status: ExpenseStatus): Promise<ExpensesOverview> {
    const response = await api.patch<unknown>(APP_CONFIG.api.endpoints.expenses.status(id), { status });
    return parseExpensesOverviewResponse(response.data) ?? invalidContract('status update');
  },

  async listVersions(): Promise<ExpenseVersion[]> {
    const response = await api.get<unknown>(APP_CONFIG.api.endpoints.expenses.versions);
    return parseExpenseVersionsResponse(response.data) ?? invalidContract('version history load');
  },

  async restoreVersion(versionId: string): Promise<ExpensesOverview> {
    const response = await api.post<unknown>(APP_CONFIG.api.endpoints.expenses.restoreVersion(versionId));
    return parseExpensesOverviewResponse(response.data) ?? invalidContract('version restore');
  }
};

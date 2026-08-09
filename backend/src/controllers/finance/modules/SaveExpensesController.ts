import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { financeService } from '../../../services/finance/FinanceServiceHandler.js';
import {
  ExpenseRequestValidationError,
  parseExpenseMutationList
} from '../utils/ExpenseRequestValidator.js';

export class SaveExpensesController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const body = req.body as unknown;
      const expenses = typeof body === 'object' && body !== null && 'expenses' in body
        ? (body as { expenses?: unknown }).expenses
        : undefined;
      const payload = parseExpenseMutationList(expenses);
      return res.status(200).json(await financeService.saveExpenses.execute(payload));
    } catch (error) {
      if (error instanceof ExpenseRequestValidationError) {
        CustomLogger.warn(`[Expenses] Bulk save rejected for ${error.field}: ${error.message}`);
        return res.status(400).json({ error: error.message, field: error.field });
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        CustomLogger.warn('[Expenses] Bulk save referenced an expense that no longer exists');
        return res.status(409).json({ error: 'Uma despesa foi alterada ou removida por outra operação. Recarregue os dados.' });
      }

      CustomLogger.error('[Expenses] Failed to persist expense ledger', error);
      return res.status(500).json({ error: 'Erro interno ao salvar o centro de custos.' });
    }
  }
}

import type { Request, Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { financeService } from '../../../services/finance/FinanceServiceHandler.js';
import {
  ExpenseRequestValidationError,
  parseExpenseId,
  parseExpenseStatusMutation
} from '../utils/ExpenseRequestValidator.js';

export class UpdateExpenseStatusController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseExpenseId(req.params.id, 'id');
      const status = parseExpenseStatusMutation(req.body as unknown);
      return res.status(200).json(await financeService.updateExpenseStatus.execute(id, status));
    } catch (error) {
      if (error instanceof ExpenseRequestValidationError) {
        CustomLogger.warn(`[Expenses] Status update rejected for ${error.field}: ${error.message}`);
        return res.status(400).json({ error: error.message, field: error.field });
      }

      if (error instanceof Error && error.message === 'ExpenseNotFoundException') {
        return res.status(404).json({ error: 'A despesa solicitada não foi encontrada.' });
      }

      CustomLogger.error('[Expenses] Failed to update expense status', error);
      return res.status(500).json({ error: 'Erro interno ao alterar o status da despesa.' });
    }
  }
}

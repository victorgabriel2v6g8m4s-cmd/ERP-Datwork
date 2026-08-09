import type { Request, Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { financeService } from '../../../services/finance/FinanceServiceHandler.js';
import {
  ExpenseRequestValidationError,
  parseExpenseId
} from '../utils/ExpenseRequestValidator.js';

export class RestoreExpenseVersionController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const versionId = parseExpenseId(req.params.id, 'versionId');
      return res.status(200).json(await financeService.restoreExpenseVersion.execute(versionId));
    } catch (error) {
      if (error instanceof ExpenseRequestValidationError) {
        CustomLogger.warn(`[Expenses] Version restore rejected for ${error.field}: ${error.message}`);
        return res.status(400).json({ error: error.message, field: error.field });
      }

      if (error instanceof Error && error.message === 'ExpenseVersionNotFoundException') {
        return res.status(404).json({ error: 'A versão solicitada não foi encontrada.' });
      }

      CustomLogger.error('[Expenses] Failed to restore expense version', error);
      return res.status(500).json({ error: 'Erro interno ao restaurar a versão de despesas.' });
    }
  }
}

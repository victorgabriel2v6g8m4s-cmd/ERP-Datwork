import type { Request, Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { financeService } from '../../../services/finance/FinanceServiceHandler.js';

export class ListExpenseVersionsController {
  async handle(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json(await financeService.listExpenseVersions.execute());
    } catch (error) {
      CustomLogger.error('[Expenses] Failed to load expense version history', error);
      return res.status(500).json({ error: 'Erro interno ao carregar o histórico de despesas.' });
    }
  }
}

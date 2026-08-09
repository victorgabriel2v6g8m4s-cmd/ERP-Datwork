import type { Request, Response } from 'express';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { financeService } from '../../../services/finance/FinanceServiceHandler.js';

export class ListExpensesController {
  async handle(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json(await financeService.listExpenses.execute());
    } catch (error) {
      CustomLogger.error('[Expenses] Failed to load expense ledger', error);
      return res.status(500).json({ error: 'Erro interno ao carregar o centro de custos.' });
    }
  }
}

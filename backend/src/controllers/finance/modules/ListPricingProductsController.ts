import { type Request, type Response } from 'express';
import { financeService } from '../../../services/finance/FinanceServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ListPricingProductsController {
  async handle(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json(await financeService.listPricingProducts.execute());
    } catch (error) {
      CustomLogger.error('[Pricing] Failed to build pricing overview', error);
      return res.status(500).json({ error: 'Erro ao consolidar o simulador de precificação.' });
    }
  }
}

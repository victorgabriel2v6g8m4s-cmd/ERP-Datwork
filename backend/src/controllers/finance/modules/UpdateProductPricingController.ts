import { type Request, type Response } from 'express';
import { financeService } from '../../../services/finance/FinanceServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import {
  PricingRequestValidationError,
  parseProductPricingMutation
} from '../utils/PricingRequestValidator.js';

export class UpdateProductPricingController {
  async handle(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    try {
      const payload = parseProductPricingMutation(id, req.body as unknown);
      return res.status(200).json(await financeService.updatePricing.execute(payload));
    } catch (error) {
      if (error instanceof PricingRequestValidationError) {
        CustomLogger.warn(`[Pricing] Product pricing update rejected for field ${error.field}: ${error.message}`);
        return res.status(400).json({ error: error.message, field: error.field });
      }

      if (error instanceof Error && error.message === 'ProductNotFoundException') {
        CustomLogger.warn(`[Pricing] Product ${id ?? '<missing>'} not found during pricing update`);
        return res.status(404).json({ error: 'O produto solicitado não foi encontrado no sistema.' });
      }

      CustomLogger.error(`[Pricing] Failed to update product pricing ${id ?? '<missing>'}`, error);
      return res.status(500).json({ error: 'Erro interno do servidor ao salvar os novos parâmetros de preço.' });
    }
  }
}

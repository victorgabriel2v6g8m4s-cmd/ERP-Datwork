import { type Request, type Response } from 'express';
import { financeService } from '../../../services/finance/FinanceServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import {
  PricingRequestValidationError,
  parsePricingSettingsMutation
} from '../utils/PricingRequestValidator.js';

export class PricingSettingsController {
  async get(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json(await financeService.settings.get());
    } catch (error) {
      CustomLogger.error('[Pricing] Failed to load global pricing settings', error);
      return res.status(500).json({ error: 'Erro interno ao buscar ajustes de precificação.' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const payload = parsePricingSettingsMutation(req.body as unknown);
      return res.status(200).json(await financeService.settings.update(payload));
    } catch (error) {
      if (error instanceof PricingRequestValidationError) {
        CustomLogger.warn(`[Pricing] Settings update rejected for field ${error.field}: ${error.message}`);
        return res.status(400).json({ error: error.message, field: error.field });
      }

      CustomLogger.error('[Pricing] Failed to update global pricing settings', error);
      return res.status(500).json({ error: 'Erro interno ao salvar ajustes de precificação.' });
    }
  }
}

import { SaveExpensesService } from './modules/SaveExpensesService.js';
import { UpdateProductPricingService } from './modules/UpdateProductPricingService.js';

class FinanceServiceHandler {
    // Gestão de Despesas brutas
    public saveExpenses = new SaveExpensesService();

    // Motor de cálculo de Precificação e margens alvos
    public updatePricing = new UpdateProductPricingService();
}

export const financeService = new FinanceServiceHandler();

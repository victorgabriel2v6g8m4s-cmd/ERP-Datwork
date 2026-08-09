import { ListPricingProductsService } from './modules/ListPricingProductsService.js';
import { PricingSettingsService } from './modules/PricingSettingsService.js';
import { SaveExpensesService } from './modules/SaveExpensesService.js';
import { UpdateProductPricingService } from './modules/UpdateProductPricingService.js';

class FinanceServiceHandler {
  public saveExpenses = new SaveExpensesService();
  public updatePricing = new UpdateProductPricingService();
  public listPricingProducts = new ListPricingProductsService();
  public settings = new PricingSettingsService();
}

export const financeService = new FinanceServiceHandler();

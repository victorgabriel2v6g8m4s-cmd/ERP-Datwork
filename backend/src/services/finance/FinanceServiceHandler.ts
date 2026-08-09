import { ListExpenseVersionsService } from './modules/ListExpenseVersionsService.js';
import { ListExpensesService } from './modules/ListExpensesService.js';
import { ListPricingProductsService } from './modules/ListPricingProductsService.js';
import { PricingSettingsService } from './modules/PricingSettingsService.js';
import { RestoreExpenseVersionService } from './modules/RestoreExpenseVersionService.js';
import { SaveExpensesService } from './modules/SaveExpensesService.js';
import { UpdateExpenseStatusService } from './modules/UpdateExpenseStatusService.js';
import { UpdateProductPricingService } from './modules/UpdateProductPricingService.js';

class FinanceServiceHandler {
  public listExpenses = new ListExpensesService();
  public saveExpenses = new SaveExpensesService();
  public updateExpenseStatus = new UpdateExpenseStatusService();
  public listExpenseVersions = new ListExpenseVersionsService();
  public restoreExpenseVersion = new RestoreExpenseVersionService();
  public updatePricing = new UpdateProductPricingService();
  public listPricingProducts = new ListPricingProductsService();
  public settings = new PricingSettingsService();
}

export const financeService = new FinanceServiceHandler();

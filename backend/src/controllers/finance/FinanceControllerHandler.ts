import { ListExpensesController } from './modules/ListExpensesController.js';
import { SaveExpensesController } from './modules/SaveExpensesController.js';
import { ListExpenseVersionsController } from './modules/ListExpenseVersionsController.js';
import { RestoreExpenseVersionController } from './modules/RestoreExpenseVersionController.js';
import { UpdateProductPricingController } from './modules/UpdateProductPricingController.js';
import { PricingSettingsController } from './modules/PricingSettingsController.js';
import { ListPricingProductsController } from './modules/ListPricingProductsController.js';
import { UpdateExpenseStatusController } from './modules/UpdateExpenseStatusController.js';

class FinanceControllerHandler {
  public listExpenses = new ListExpensesController();
  public saveExpenses = new SaveExpensesController();
  public listVersions = new ListExpenseVersionsController();
  public restoreExpenseVersion = new RestoreExpenseVersionController();
  public updatePricing = new UpdateProductPricingController();
  public settings = new PricingSettingsController();
  public listPricingProducts = new ListPricingProductsController();
  public updateExpenseStatus = new UpdateExpenseStatusController();
}

export const financeController = new FinanceControllerHandler();

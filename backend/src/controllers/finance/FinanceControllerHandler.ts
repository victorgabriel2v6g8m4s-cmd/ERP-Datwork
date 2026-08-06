import { ListExpensesController } from './modules/ListExpensesController.js';
import { SaveExpensesController } from './modules/SaveExpensesController.js';
import { ListExpenseVersionsController } from './modules/ListExpenseVersionsController.js';
import { UpdateProductPricingController } from './modules/UpdateProductPricingController.js';
import { PricingSettingsController } from './modules/PricingSettingsController.js';
import { ListPricingProductsController } from './modules/ListPricingProductsController.js';
import { UpdateExpenseStatusController } from './modules/UpdateExpenseStatusController.js';

class FinanceControllerHandler {
    // Instancia cada controller do sub-módulo uma única vez na inicialização da classe
    public listExpenses = new ListExpensesController();
    public saveExpenses = new SaveExpensesController();
    public listVersions = new ListExpenseVersionsController();
    public updatePricing = new UpdateProductPricingController();
    public settings = new PricingSettingsController();
    public listPricingProducts = new ListPricingProductsController();
    public updateExpenseStatus = new UpdateExpenseStatusController();
}

// Exporta uma única instância unificada pronta para ser acoplada às rotas (Singleton)
export const financeController = new FinanceControllerHandler();

import { Router } from 'express';
import { financeController } from '../../controllers/finance/FinanceControllerHandler.js';
import { isAuthenticated } from '../../middlewares/auth.js';

const financeRouter = Router();

financeRouter.use(isAuthenticated);

financeRouter.get('/expenses', financeController.listExpenses.handle);
financeRouter.post('/expenses', financeController.saveExpenses.handle);
financeRouter.patch('/expenses/:id/status', financeController.updateExpenseStatus.handle);
financeRouter.get('/expenses/versions', financeController.listVersions.handle);
financeRouter.post('/expenses/versions/:id/restore', financeController.restoreExpenseVersion.handle);

financeRouter.get('/pricing/products', financeController.listPricingProducts.handle);
financeRouter.patch('/pricing/products/:id', financeController.updatePricing.handle);

financeRouter.get('/settings', financeController.settings.get);
financeRouter.put('/settings', financeController.settings.update);

export { financeRouter };

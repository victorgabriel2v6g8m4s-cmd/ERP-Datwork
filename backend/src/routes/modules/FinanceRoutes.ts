import { Router } from 'express';
import { financeController } from '../../controllers/finance/FinanceControllerHandler.js';
import { isAuthenticated } from '../../middlewares/auth.js';

const financeRouter = Router();

// Aplica o middleware de segurança em todas as rotas financeiras
financeRouter.use(isAuthenticated);

// 📊 Planilha de Centro de Custos / Despesas (Apenas 1 import!)
financeRouter.get('/expenses', financeController.listExpenses.handle);
financeRouter.post('/expenses', financeController.saveExpenses.handle);
financeRouter.patch('/expenses/:id/status', financeController.updateExpenseStatus.handle);
financeRouter.get('/expenses/versions', financeController.listVersions.handle);

// 🧮 Painel do Simulador de Precificação Dinâmica
financeRouter.get('/pricing/products', financeController.listPricingProducts.handle);
financeRouter.patch('/pricing/products/:id', financeController.updatePricing.handle);

// ⚙️ Constantes Globais (Teto de Capacidade e Margens Alvo ABC)
financeRouter.get('/settings', financeController.settings.get);
financeRouter.put('/settings', financeController.settings.update);

export { financeRouter };

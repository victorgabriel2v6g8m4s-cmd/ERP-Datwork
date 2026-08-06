import { Router } from 'express';
// 🌟 Importação dos sub-módulos com nomenclaturas limpas e extensões .js explícitas
import { agendaRouter } from './routes/modules/AgendaRoutes.js';
import { productRouter } from './routes/modules/ProductRoutes.js';
import { ingredientRouter } from './routes/modules/IngredientRoutes.js';
import { recipeRouter } from './routes/modules/RecipeRoutes.js';
import { financeRouter } from './routes/modules/FinanceRoutes.js';
import { utilRouter } from './routes/modules/UtilRoutes.js';

const router = Router();

// 🚀 Vinculação dos sub-módulos com seus respectivos escopos e prefixos de rota REST
router.use('/appointments', agendaRouter);
router.use('/products', productRouter);

// Módulos que gerenciam seus próprios prefixos internos plurais de forma desacoplada
router.use(ingredientRouter); // Gerencia internamente as sub-rotas (/ingredients)
router.use(recipeRouter);     // Gerencia internamente as sub-rotas (/recipes)
router.use(financeRouter);    // Gerencia internamente as sub-rotas (/expenses, /pricing, /settings)

// Utilitários públicos de apoio operacional ao ERP (Ex: Consulta de endereço automática por CEP)
router.use(utilRouter);       // Gerencia sub-rotas utilitárias (/cep)

export { router };

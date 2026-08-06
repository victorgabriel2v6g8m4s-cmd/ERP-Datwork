import { Router } from 'express';
import { ingredientController } from '../../controllers/ingredient/IngredientControllerHandler.js';
import { isAuthenticated } from '../../middlewares/auth.js';

const ingredientRouter = Router();

// Aplica o middleware de segurança em todas as rotas de insumos
ingredientRouter.use(isAuthenticated);

// Fluxos do Módulo de Insumos (Apenas 1 import!)
ingredientRouter.post('/ingredients', ingredientController.create.handle);
ingredientRouter.get('/ingredients', ingredientController.list.handle);
ingredientRouter.put('/ingredients/:id', ingredientController.update.handle);
ingredientRouter.patch('/ingredients/:id/status', ingredientController.updateStatus.handle);

export { ingredientRouter };

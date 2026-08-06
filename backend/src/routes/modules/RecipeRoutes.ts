import { Router } from 'express';
import { recipeController } from '../../controllers/recipe/RecipeControllerHandler.js';
import { isAuthenticated } from '../../middlewares/auth.js';

const recipeRouter = Router();

// Aplica o middleware de segurança em todas as rotas de fichas técnicas
recipeRouter.use(isAuthenticated);

// Fluxos do Módulo de Receitas / Fichas Técnicas (Apenas 1 import!)
recipeRouter.post('/recipes', recipeController.create.handle);
recipeRouter.get('/recipes', recipeController.list.handle);
recipeRouter.put('/recipes/:id', recipeController.update.handle);
recipeRouter.patch('/recipes/reorder', recipeController.reorder.handle);
recipeRouter.patch('/recipes/:id/status', recipeController.updateStatus.handle);

export { recipeRouter };

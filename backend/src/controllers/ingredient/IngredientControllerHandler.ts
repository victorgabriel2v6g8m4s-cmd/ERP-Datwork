import { CreateIngredientController } from './modules/CreateIngredientController.js';
import { ListIngredientsController } from './modules/ListIngredientsController.js';
import { UpdateIngredientController } from './modules/UpdateIngredientController.js';
import { UpdateIngredientStatusController } from './modules/UpdateIngredientStatusController.js';

class IngredientControllerHandler {
    // Instancia cada controller do sub-módulo uma única vez na inicialização da classe
    public create = new CreateIngredientController();
    public list = new ListIngredientsController();
    public update = new UpdateIngredientController();
    public updateStatus = new UpdateIngredientStatusController();
}

// Exporta uma única instância unificada pronta para ser acoplada às rotas (Singleton)
export const ingredientController = new IngredientControllerHandler();

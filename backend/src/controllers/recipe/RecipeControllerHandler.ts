import { CreateRecipeController } from './modules/CreateRecipeController.js';
import { ListRecipesController } from './modules/ListRecipesController.js';
import { UpdateRecipeController } from './modules/UpdateRecipeController.js';
import { ReorderRecipesController } from './modules/ReorderRecipesController.js';
import { UpdateRecipeStatusController } from './modules/UpdateRecipeStatusController.js'; 

class RecipeControllerHandler {
    public create = new CreateRecipeController();
    public list = new ListRecipesController();
    public update = new UpdateRecipeController();
    public reorder = new ReorderRecipesController();
    public updateStatus = new UpdateRecipeStatusController();
}

export const recipeController = new RecipeControllerHandler();

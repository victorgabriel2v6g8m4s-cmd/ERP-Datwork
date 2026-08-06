import { CreateRecipeService } from './modules/CreateRecipeService.js';
import { ReorderRecipesService } from './modules/ReorderRecipesService.js';
import { UpdateRecipeService } from './modules/UpdateRecipeService.js';

class RecipeServiceHandler {
    public create = new CreateRecipeService();
    public reorder = new ReorderRecipesService();
    public update = new UpdateRecipeService();
}

export const recipeService = new RecipeServiceHandler();

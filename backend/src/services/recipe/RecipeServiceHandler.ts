import { CreateRecipeService } from './modules/CreateRecipeService.js';
import { ListRecipesService } from './modules/ListRecipesService.js';
import { ReorderRecipesService } from './modules/ReorderRecipesService.js';
import { UpdateRecipeService } from './modules/UpdateRecipeService.js';
import { UpdateRecipeStatusService } from './modules/UpdateRecipeStatusService.js';

class RecipeServiceHandler {
  public create = new CreateRecipeService();
  public list = new ListRecipesService();
  public reorder = new ReorderRecipesService();
  public update = new UpdateRecipeService();
  public updateStatus = new UpdateRecipeStatusService();
}

export const recipeService = new RecipeServiceHandler();

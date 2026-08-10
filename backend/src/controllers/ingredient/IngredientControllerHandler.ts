import { CreateIngredientController } from './modules/CreateIngredientController.js';
import { IngredientOrderProfileController } from './modules/IngredientOrderProfileController.js';
import { ListIngredientsController } from './modules/ListIngredientsController.js';
import { ListIngredientVersionsController } from './modules/ListIngredientVersionsController.js';
import { ReorderIngredientsController } from './modules/ReorderIngredientsController.js';
import { UpdateIngredientController } from './modules/UpdateIngredientController.js';
import { UpdateIngredientStatusController } from './modules/UpdateIngredientStatusController.js';

class IngredientControllerHandler {
  public create = new CreateIngredientController();
  public list = new ListIngredientsController();
  public listVersions = new ListIngredientVersionsController();
  public reorder = new ReorderIngredientsController();
  public orderProfiles = new IngredientOrderProfileController();
  public update = new UpdateIngredientController();
  public updateStatus = new UpdateIngredientStatusController();
}

export const ingredientController = new IngredientControllerHandler();

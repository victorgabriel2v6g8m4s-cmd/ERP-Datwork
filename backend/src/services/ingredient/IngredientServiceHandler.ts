import { CreateIngredientService } from './modules/CreateIngredientService.js';
import { UpdateIngredientService } from './modules/UpdateIngredientService.js';
import { UpdateIngredientStatusService } from './modules/UpdateIngredientStatusService.js';

class IngredientServiceHandler {
  public create = new CreateIngredientService();
  public update = new UpdateIngredientService();
  public updateStatus = new UpdateIngredientStatusService();
}

export const ingredientService = new IngredientServiceHandler();

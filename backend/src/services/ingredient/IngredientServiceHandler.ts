import { CreateIngredientService } from './modules/CreateIngredientService.js';
import { IngredientOrderProfileService } from './modules/IngredientOrderProfileService.js';
import { ListIngredientsService } from './modules/ListIngredientsService.js';
import { ListIngredientVersionsService } from './modules/ListIngredientVersionsService.js';
import { ReorderIngredientsService } from './modules/ReorderIngredientsService.js';
import { UpdateIngredientService } from './modules/UpdateIngredientService.js';
import { UpdateIngredientStatusService } from './modules/UpdateIngredientStatusService.js';

class IngredientServiceHandler {
  public create = new CreateIngredientService();
  public list = new ListIngredientsService();
  public listVersions = new ListIngredientVersionsService();
  public reorder = new ReorderIngredientsService();
  public orderProfiles = new IngredientOrderProfileService();
  public update = new UpdateIngredientService();
  public updateStatus = new UpdateIngredientStatusService();
}

export const ingredientService = new IngredientServiceHandler();

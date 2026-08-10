import prismaClient from '../../../config/prisma.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentIngredient } from '../../../presenters/ingredient/IngredientPresenter.js';
import type { IngredientResponse } from '../../../contracts/ingredient/IngredientContract.js';

export class ListIngredientsService {
  async execute(): Promise<IngredientResponse[]> {
    CustomLogger.info('[Ingredients] Loading ingredient catalog');

    const ingredients = await prismaClient.ingredient.findMany({
      orderBy: { position: 'asc' }
    });

    return ingredients.map(presentIngredient);
  }
}

import { ScopedOrderProfileService } from '../../orderProfile/ScopedOrderProfileService.js';

export class IngredientOrderProfileService extends ScopedOrderProfileService {
  constructor() {
    super('INGREDIENT');
  }
}

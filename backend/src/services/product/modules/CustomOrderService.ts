import { ScopedOrderProfileService } from '../../orderProfile/ScopedOrderProfileService.js';

export class CustomOrderService extends ScopedOrderProfileService {
  constructor() {
    super('PRODUCT');
  }
}

import type { ProductStatus } from '../../../types/product.ts';

export function getToggledProductStatus(status: ProductStatus): ProductStatus {
  return status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
}

import type { ProductCode } from './product.js';

export interface PriceProvider {
  getPrice(productCode: ProductCode): number;
}

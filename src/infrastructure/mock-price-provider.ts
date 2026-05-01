import type { PriceProvider } from '../domain/price-provider.js';
import type { ProductCode } from '../domain/product.js';

export class MockPriceProvider implements PriceProvider {
  private readonly prices: Readonly<Record<ProductCode, number>> = {
    APE: 75,
    PUNK: 60,
    AZUKI: 30,
    MEEBIT: 4,
  };

  getPrice(productCode: ProductCode): number {
    return this.prices[productCode];
  }
}

import { Checkout } from './application/checkout.js';
import {
  BulkPercentageDiscountRule,
  BuyXGetYFreeRule,
  type DiscountRule,
} from './domain/discount-rule.js';
import { MockPriceProvider } from './infrastructure/mock-price-provider.js';

export { Checkout } from './application/checkout.js';
export type {
  CartItem,
  CheckoutConfig,
  CheckoutSummary,
  CheckoutSummaryLine,
} from './application/checkout.js';
export {
  BulkPercentageDiscountRule,
  BuyXGetYFreeRule,
  type DiscountRule,
} from './domain/discount-rule.js';
export type { PriceProvider } from './domain/price-provider.js';
export type { ProductCode } from './domain/product.js';
export { MockPriceProvider } from './infrastructure/mock-price-provider.js';

export const defaultDiscountRules: readonly DiscountRule[] = [
  new BuyXGetYFreeRule(['APE', 'AZUKI'], 2, 1),
  new BulkPercentageDiscountRule(['PUNK', 'AZUKI'], 3, 20),
];

export function createDefaultCheckout(): Checkout {
  return new Checkout({
    priceProvider: new MockPriceProvider(),
    discountRules: defaultDiscountRules,
  });
}

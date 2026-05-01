import type { DiscountRule } from './discount-rule.js';
import type { ProductCode } from './product.js';

export interface ProductSubtotalResult {
  subtotal: number;
  appliedDiscountName: string | null;
}

export function calculateProductSubtotal(
  productCode: ProductCode,
  quantity: number,
  unitPrice: number,
  discountRules: readonly DiscountRule[],
): number {
  return calculateBestProductSubtotal(productCode, quantity, unitPrice, discountRules).subtotal;
}

export function calculateBestProductSubtotal(
  productCode: ProductCode,
  quantity: number,
  unitPrice: number,
  discountRules: readonly DiscountRule[],
): ProductSubtotalResult {
  const regularSubtotal = quantity * unitPrice;
  const bestDiscountedSubtotal = discountRules
    .filter((rule) => rule.appliesTo(productCode))
    .map((rule) => ({
      name: rule.name,
      subtotal: rule.calculateSubtotal({ productCode, quantity, unitPrice }),
    }))
    .reduce<ProductSubtotalResult>(
      (bestResult, currentResult) =>
        currentResult.subtotal < bestResult.subtotal
          ? {
              subtotal: currentResult.subtotal,
              appliedDiscountName: currentResult.name,
            }
          : bestResult,
      {
        subtotal: regularSubtotal,
        appliedDiscountName: null,
      },
    );

  return bestDiscountedSubtotal;
}

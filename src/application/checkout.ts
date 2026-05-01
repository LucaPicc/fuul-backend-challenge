import { calculateBestProductSubtotal } from '../domain/calculate-product-subtotal.js';
import type { DiscountRule } from '../domain/discount-rule.js';
import type { PriceProvider } from '../domain/price-provider.js';
import { parseProductCode, type ProductCode } from '../domain/product.js';

export interface CheckoutConfig {
  priceProvider: PriceProvider;
  discountRules: readonly DiscountRule[];
}

export interface CartItem {
  productCode: ProductCode;
  quantity: number;
}

export interface CheckoutSummaryLine {
  productCode: ProductCode;
  quantity: number;
  unitPrice: number;
  regularSubtotal: number;
  finalSubtotal: number;
  discountAmount: number;
  appliedDiscountName: string | null;
}

export interface CheckoutSummary {
  regularTotal: number;
  discountTotal: number;
  finalTotal: number;
  lines: CheckoutSummaryLine[];
}

export class Checkout {
  private readonly cart = new Map<ProductCode, number>();

  constructor(private readonly config: CheckoutConfig) {}

  scan(productCode: string): void {
    const parsedProductCode = parseProductCode(productCode);
    const currentQuantity = this.cart.get(parsedProductCode) ?? 0;

    this.cart.set(parsedProductCode, currentQuantity + 1);
  }

  remove(productCode: string): void {
    const parsedProductCode = parseProductCode(productCode);
    const currentQuantity = this.cart.get(parsedProductCode) ?? 0;

    if (currentQuantity <= 1) {
      this.cart.delete(parsedProductCode);
      return;
    }

    this.cart.set(parsedProductCode, currentQuantity - 1);
  }

  total(): number {
    return this.summary().finalTotal;
  }

  summary(): CheckoutSummary {
    const lines: CheckoutSummaryLine[] = [];

    for (const [productCode, quantity] of this.cart.entries()) {
      const unitPrice = this.config.priceProvider.getPrice(productCode);
      const regularSubtotal = quantity * unitPrice;
      const bestSubtotal = calculateBestProductSubtotal(
        productCode,
        quantity,
        unitPrice,
        this.config.discountRules,
      );

      lines.push({
        productCode,
        quantity,
        unitPrice,
        regularSubtotal,
        finalSubtotal: bestSubtotal.subtotal,
        discountAmount: regularSubtotal - bestSubtotal.subtotal,
        appliedDiscountName: bestSubtotal.appliedDiscountName,
      });
    }

    const regularTotal = lines.reduce((total, line) => total + line.regularSubtotal, 0);
    const finalTotal = lines.reduce((total, line) => total + line.finalSubtotal, 0);

    return {
      regularTotal,
      discountTotal: regularTotal - finalTotal,
      finalTotal,
      lines,
    };
  }

  items(): CartItem[] {
    return Array.from(this.cart.entries()).map(([productCode, quantity]) => ({
      productCode,
      quantity,
    }));
  }
}

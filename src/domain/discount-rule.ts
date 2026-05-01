import type { ProductCode } from './product.js';

export interface DiscountContext {
  productCode: ProductCode;
  quantity: number;
  unitPrice: number;
}

export interface DiscountRule {
  readonly name: string;
  appliesTo(productCode: ProductCode): boolean;
  calculateSubtotal(context: DiscountContext): number;
}

export class BuyXGetYFreeRule implements DiscountRule {
  readonly name: string;
  private readonly eligibleProducts: ReadonlySet<ProductCode>;

  constructor(
    eligibleProducts: readonly ProductCode[],
    private readonly paidQuantity: number,
    private readonly freeQuantity: number,
  ) {
    this.name = `buy-${paidQuantity}-get-${freeQuantity}-free`;
    this.eligibleProducts = new Set(eligibleProducts);
  }

  appliesTo(productCode: ProductCode): boolean {
    return this.eligibleProducts.has(productCode);
  }

  calculateSubtotal({ quantity, unitPrice }: DiscountContext): number {
    const groupSize = this.paidQuantity + this.freeQuantity;
    const fullGroups = Math.floor(quantity / groupSize);
    const remainingItems = quantity % groupSize;
    const paidItems = fullGroups * this.paidQuantity + remainingItems;

    return paidItems * unitPrice;
  }
}

export class BulkPercentageDiscountRule implements DiscountRule {
  readonly name: string;
  private readonly eligibleProducts: ReadonlySet<ProductCode>;

  constructor(
    eligibleProducts: readonly ProductCode[],
    private readonly minimumQuantity: number,
    private readonly discountPercentage: number,
  ) {
    this.name = `bulk-${discountPercentage}-percent-off`;
    this.eligibleProducts = new Set(eligibleProducts);
  }

  appliesTo(productCode: ProductCode): boolean {
    return this.eligibleProducts.has(productCode);
  }

  calculateSubtotal({ quantity, unitPrice }: DiscountContext): number {
    if (quantity < this.minimumQuantity) {
      return quantity * unitPrice;
    }

    return quantity * unitPrice * (1 - this.discountPercentage / 100);
  }
}

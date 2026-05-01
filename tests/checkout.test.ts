import { describe, expect, it } from 'vitest';

import {
  Checkout,
  MockPriceProvider,
  createDefaultCheckout,
  defaultDiscountRules,
  type DiscountRule,
} from '../src/index.js';
import type { DiscountContext } from '../src/domain/discount-rule.js';
import type { ProductCode } from '../src/domain/product.js';

function checkoutWith(items: string[]): Checkout {
  const checkout = createDefaultCheckout();

  for (const item of items) {
    checkout.scan(item);
  }

  return checkout;
}

describe('Checkout', () => {
  it.each([
    [['APE', 'PUNK', 'MEEBIT'], 139],
    [['APE', 'PUNK', 'APE'], 210],
    [['PUNK', 'PUNK', 'PUNK', 'APE', 'PUNK'], 267],
    [['APE', 'PUNK', 'APE', 'APE', 'MEEBIT', 'PUNK', 'PUNK'], 298],
    [['AZUKI', 'AZUKI', 'AZUKI'], 60],
  ])('calculates the total for %j', (items, expectedTotal) => {
    expect(checkoutWith(items).total()).toBe(expectedTotal);
  });

  it('calculates the same total regardless of scan order', () => {
    const firstCheckout = checkoutWith(['APE', 'PUNK', 'MEEBIT']);
    const secondCheckout = checkoutWith(['MEEBIT', 'APE', 'PUNK']);

    expect(firstCheckout.total()).toBe(secondCheckout.total());
  });

  it('removes one item from the cart', () => {
    const checkout = checkoutWith(['APE', 'APE', 'PUNK']);

    checkout.remove('APE');

    expect(checkout.total()).toBe(135);
  });

  it('returns an empty item list for a new checkout', () => {
    expect(createDefaultCheckout().items()).toEqual([]);
  });

  it('returns an empty summary for a new checkout', () => {
    expect(createDefaultCheckout().summary()).toEqual({
      regularTotal: 0,
      discountTotal: 0,
      finalTotal: 0,
      lines: [],
    });
  });

  it('returns current quantities without exposing the internal cart', () => {
    const checkout = checkoutWith(['APE', 'APE', 'PUNK']);
    const items = checkout.items();

    items.push({ productCode: 'MEEBIT', quantity: 10 });

    expect(checkout.items()).toEqual([
      { productCode: 'APE', quantity: 2 },
      { productCode: 'PUNK', quantity: 1 },
    ]);
  });

  it('updates item quantities after remove', () => {
    const checkout = checkoutWith(['APE', 'APE', 'PUNK']);

    checkout.remove('APE');

    expect(checkout.items()).toEqual([
      { productCode: 'APE', quantity: 1 },
      { productCode: 'PUNK', quantity: 1 },
    ]);
  });

  it('ignores removing an absent valid product', () => {
    const checkout = checkoutWith(['PUNK']);

    checkout.remove('APE');

    expect(checkout.total()).toBe(60);
  });

  it('summarizes products without discounts', () => {
    expect(checkoutWith(['APE', 'PUNK', 'MEEBIT']).summary()).toEqual({
      regularTotal: 139,
      discountTotal: 0,
      finalTotal: 139,
      lines: [
        {
          productCode: 'APE',
          quantity: 1,
          unitPrice: 75,
          regularSubtotal: 75,
          finalSubtotal: 75,
          discountAmount: 0,
          appliedDiscountName: null,
        },
        {
          productCode: 'PUNK',
          quantity: 1,
          unitPrice: 60,
          regularSubtotal: 60,
          finalSubtotal: 60,
          discountAmount: 0,
          appliedDiscountName: null,
        },
        {
          productCode: 'MEEBIT',
          quantity: 1,
          unitPrice: 4,
          regularSubtotal: 4,
          finalSubtotal: 4,
          discountAmount: 0,
          appliedDiscountName: null,
        },
      ],
    });
  });

  it('summarizes buy 2 get 1 free discounts', () => {
    expect(checkoutWith(['APE', 'APE', 'APE']).summary()).toEqual({
      regularTotal: 225,
      discountTotal: 75,
      finalTotal: 150,
      lines: [
        {
          productCode: 'APE',
          quantity: 3,
          unitPrice: 75,
          regularSubtotal: 225,
          finalSubtotal: 150,
          discountAmount: 75,
          appliedDiscountName: 'buy-2-get-1-free',
        },
      ],
    });
  });

  it('summarizes bulk percentage discounts', () => {
    expect(checkoutWith(['PUNK', 'PUNK', 'PUNK', 'PUNK']).summary()).toEqual({
      regularTotal: 240,
      discountTotal: 48,
      finalTotal: 192,
      lines: [
        {
          productCode: 'PUNK',
          quantity: 4,
          unitPrice: 60,
          regularSubtotal: 240,
          finalSubtotal: 192,
          discountAmount: 48,
          appliedDiscountName: 'bulk-20-percent-off',
        },
      ],
    });
  });

  it('summarizes the best discount for products with multiple promotions', () => {
    expect(checkoutWith(['AZUKI', 'AZUKI', 'AZUKI']).summary()).toEqual({
      regularTotal: 90,
      discountTotal: 30,
      finalTotal: 60,
      lines: [
        {
          productCode: 'AZUKI',
          quantity: 3,
          unitPrice: 30,
          regularSubtotal: 90,
          finalSubtotal: 60,
          discountAmount: 30,
          appliedDiscountName: 'buy-2-get-1-free',
        },
      ],
    });
  });

  it('uses the summary final total as the checkout total', () => {
    const checkout = checkoutWith(['APE', 'APE', 'APE', 'PUNK', 'PUNK', 'PUNK', 'PUNK']);

    expect(checkout.total()).toBe(checkout.summary().finalTotal);
  });

  it('rejects unknown products', () => {
    const checkout = createDefaultCheckout();

    expect(() => checkout.scan('INVALID')).toThrow('Unknown product code: INVALID');
    expect(() => checkout.remove('INVALID')).toThrow('Unknown product code: INVALID');
  });

  it('accepts new discount rules without changing Checkout', () => {
    const halfPriceMeebitRule: DiscountRule = {
      name: 'half-price-meebit',
      appliesTo(productCode: ProductCode): boolean {
        return productCode === 'MEEBIT';
      },
      calculateSubtotal({ quantity, unitPrice }: DiscountContext): number {
        return quantity * unitPrice * 0.5;
      },
    };
    const checkout = new Checkout({
      priceProvider: new MockPriceProvider(),
      discountRules: [...defaultDiscountRules, halfPriceMeebitRule],
    });

    checkout.scan('MEEBIT');
    checkout.scan('MEEBIT');

    expect(checkout.total()).toBe(4);
  });
});

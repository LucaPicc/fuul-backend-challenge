import { describe, expect, it } from 'vitest';

import {
  renderActionSummary,
  renderCart,
  renderTitle,
  renderTotalBreakdown,
} from '../src/cli-renderer.js';
import type { CartItem, CheckoutSummary } from '../src/index.js';

const withoutColors = { colors: false };

describe('CLI renderer', () => {
  it('renders the title without color codes', () => {
    expect(renderTitle(withoutColors)).toBe('NFT Marketplace Checkout Simulator');
  });

  it('renders an empty cart', () => {
    expect(renderCart([], withoutColors)).toBe('Cart is empty');
  });

  it('renders cart quantities as a table', () => {
    const items: CartItem[] = [
      { productCode: 'APE', quantity: 2 },
      { productCode: 'PUNK', quantity: 1 },
    ];

    expect(renderCart(items, withoutColors)).toBe(
      ['Product  Qty', '-------  ---', 'APE      2  ', 'PUNK     1  '].join('\n'),
    );
  });

  it('renders an empty total breakdown', () => {
    const summary: CheckoutSummary = {
      regularTotal: 0,
      discountTotal: 0,
      finalTotal: 0,
      lines: [],
    };

    expect(renderTotalBreakdown(summary, withoutColors)).toBe(
      ['Regular total: 0 ETH', 'Discounts: 0 ETH', 'Total: 0 ETH'].join('\n'),
    );
  });

  it('renders total breakdown with applied discounts', () => {
    const summary: CheckoutSummary = {
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
    };

    expect(renderTotalBreakdown(summary, withoutColors)).toBe(
      [
        'Product  Qty  Unit    Regular  Discount                    Subtotal',
        '-------  ---  ------  -------  --------------------------  --------',
        'APE      3    75 ETH  225 ETH  buy-2-get-1-free (-75 ETH)  150 ETH ',
        '',
        'Regular total: 225 ETH',
        'Discounts: -75 ETH',
        'Total: 150 ETH',
      ].join('\n'),
    );
  });

  it('renders the action summary', () => {
    const items: CartItem[] = [{ productCode: 'MEEBIT', quantity: 1 }];
    const summary: CheckoutSummary = {
      regularTotal: 4,
      discountTotal: 0,
      finalTotal: 4,
      lines: [],
    };

    expect(renderActionSummary(items, summary, withoutColors)).toBe(
      ['Current cart', 'Product  Qty', '-------  ---', 'MEEBIT   1  ', '', 'Total: 4 ETH'].join(
        '\n',
      ),
    );
  });
});

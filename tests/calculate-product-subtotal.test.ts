import { describe, expect, it } from 'vitest';

import { calculateProductSubtotal } from '../src/domain/calculate-product-subtotal.js';
import { BuyXGetYFreeRule } from '../src/domain/discount-rule.js';

describe('calculateProductSubtotal', () => {
  it('returns the numeric subtotal for the best available discount', () => {
    expect(calculateProductSubtotal('APE', 3, 75, [new BuyXGetYFreeRule(['APE'], 2, 1)])).toBe(150);
  });
});

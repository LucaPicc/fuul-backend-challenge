export const productCodes = ['APE', 'PUNK', 'AZUKI', 'MEEBIT'] as const;

export type ProductCode = (typeof productCodes)[number];

export function isProductCode(value: string): value is ProductCode {
  return productCodes.includes(value as ProductCode);
}

export function parseProductCode(value: string): ProductCode {
  if (!isProductCode(value)) {
    throw new Error(`Unknown product code: ${value}`);
  }

  return value;
}

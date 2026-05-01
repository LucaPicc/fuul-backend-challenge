import type { CartItem, CheckoutSummary } from './index.js';

type Color = (value: string) => string;

export interface RenderOptions {
  colors?: boolean;
}

const ansi = {
  bold: '\u001b[1m',
  cyan: '\u001b[36m',
  green: '\u001b[32m',
  gray: '\u001b[90m',
  red: '\u001b[31m',
  reset: '\u001b[0m',
  yellow: '\u001b[33m',
};

function colorize(code: string, colors: boolean): Color {
  return (value: string) => (colors ? `${code}${value}${ansi.reset}` : value);
}

function renderTable(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => row[index]?.length ?? 0)),
  );
  const renderRow = (row: readonly string[]) =>
    row.map((cell, index) => cell.padEnd(widths[index] ?? 0)).join('  ');
  const separator = widths.map((width) => '-'.repeat(width)).join('  ');

  return [renderRow(headers), separator, ...rows.map(renderRow)].join('\n');
}

export function renderTitle(options: RenderOptions = {}): string {
  const cyan = colorize(ansi.cyan, options.colors ?? true);
  const bold = colorize(ansi.bold, options.colors ?? true);

  return bold(cyan('NFT Marketplace Checkout Simulator'));
}

export function renderCart(items: readonly CartItem[], options: RenderOptions = {}): string {
  const gray = colorize(ansi.gray, options.colors ?? true);

  if (items.length === 0) {
    return gray('Cart is empty');
  }

  return renderTable(
    ['Product', 'Qty'],
    items.map(({ productCode, quantity }) => [productCode, String(quantity)]),
  );
}

export function renderTotalBreakdown(
  summary: CheckoutSummary,
  options: RenderOptions = {},
): string {
  const bold = colorize(ansi.bold, options.colors ?? true);
  const green = colorize(ansi.green, options.colors ?? true);
  const yellow = colorize(ansi.yellow, options.colors ?? true);

  if (summary.lines.length === 0) {
    return ['Regular total: 0 ETH', 'Discounts: 0 ETH', green(bold('Total: 0 ETH'))].join('\n');
  }

  const table = renderTable(
    ['Product', 'Qty', 'Unit', 'Regular', 'Discount', 'Subtotal'],
    summary.lines.map((line) => [
      line.productCode,
      String(line.quantity),
      `${line.unitPrice} ETH`,
      `${line.regularSubtotal} ETH`,
      line.discountAmount > 0 && line.appliedDiscountName !== null
        ? `${line.appliedDiscountName} (-${line.discountAmount} ETH)`
        : 'none',
      `${line.finalSubtotal} ETH`,
    ]),
  );
  const totals = [
    `Regular total: ${summary.regularTotal} ETH`,
    yellow(`Discounts: -${summary.discountTotal} ETH`),
    green(bold(`Total: ${summary.finalTotal} ETH`)),
  ].join('\n');

  return `${table}\n\n${totals}`;
}

export function renderActionSummary(
  items: readonly CartItem[],
  summary: CheckoutSummary,
  options: RenderOptions = {},
): string {
  const bold = colorize(ansi.bold, options.colors ?? true);
  const green = colorize(ansi.green, options.colors ?? true);

  return [
    bold('Current cart'),
    renderCart(items, options),
    '',
    green(bold(`Total: ${summary.finalTotal} ETH`)),
  ].join('\n');
}

export function renderError(message: string, options: RenderOptions = {}): string {
  const red = colorize(ansi.red, options.colors ?? true);

  return red(message);
}

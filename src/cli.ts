import { select } from '@inquirer/prompts';

import { createDefaultCheckout } from './index.js';
import {
  renderActionSummary,
  renderCart,
  renderError,
  renderTitle,
  renderTotalBreakdown,
} from './cli-renderer.js';
import { productCodes, type ProductCode } from './domain/product.js';

type Action = 'scan' | 'remove' | 'cart' | 'total' | 'exit';

const checkout = createDefaultCheckout();

async function chooseProduct(message: string): Promise<ProductCode> {
  return select<ProductCode>({
    message,
    choices: productCodes.map((productCode) => ({
      name: productCode,
      value: productCode,
    })),
  });
}

async function chooseAction(): Promise<Action> {
  return select<Action>({
    message: 'Choose an action',
    choices: [
      { name: 'Scan item', value: 'scan' },
      { name: 'Remove item', value: 'remove' },
      { name: 'View cart', value: 'cart' },
      { name: 'View total breakdown', value: 'total' },
      { name: 'Exit', value: 'exit' },
    ],
  });
}

function showSummary(): void {
  console.log(`\n${renderActionSummary(checkout.items(), checkout.summary())}\n`);
}

async function run(): Promise<void> {
  console.log(`${renderTitle()}\n`);

  while (true) {
    const action = await chooseAction();

    if (action === 'exit') {
      console.log('Checkout simulation finished.');
      return;
    }

    try {
      if (action === 'scan') {
        checkout.scan(await chooseProduct('Select a product to scan'));
        showSummary();
      }

      if (action === 'remove') {
        checkout.remove(await chooseProduct('Select a product to remove'));
        showSummary();
      }

      if (action === 'cart') {
        console.log(`\n${renderCart(checkout.items())}\n`);
      }

      if (action === 'total') {
        console.log(`\n${renderTotalBreakdown(checkout.summary())}\n`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      console.error(`\n${renderError(message)}\n`);
    }
  }
}

function isPromptExit(error: unknown): boolean {
  return error instanceof Error && error.name === 'ExitPromptError';
}

run().catch((error: unknown) => {
  if (isPromptExit(error)) {
    console.log('\nCheckout simulation finished.');
    return;
  }

  throw error;
});

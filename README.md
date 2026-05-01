# Fuul Backend Challenge

Checkout system for an NFT marketplace. The application calculates cart totals, applies product discounts, mocks an external price source, and includes an interactive CLI simulator.

## Approach

The solution uses a lightweight Clean Architecture approach. The project keeps business rules separate from infrastructure and CLI concerns, but avoids creating layers that are not needed for the size of the challenge.

- `src/domain/`: product codes, discount rules, subtotal calculation, and contracts.
- `src/application/`: `Checkout`, the main use case used by tests and the CLI.
- `src/infrastructure/`: `MockPriceProvider`, which represents the external price source.
- `src/cli.ts`: interactive simulator.
- `src/cli-renderer.ts`: terminal rendering helpers for tables and colors.

SOLID is applied pragmatically: discount rules are open for extension, price lookup is injected through a contract, and the CLI delegates all pricing behavior to `Checkout`.

## Discount Decisions

The challenge leaves `AZUKI` ambiguous because it qualifies for both promotions. This implementation does not stack discounts. Instead, each applicable rule is evaluated independently and the best subtotal is selected.

For three equal products:

- `APE x3`: `buy-2-get-1-free`, total `150 ETH`.
- `PUNK x3`: bulk discount, total `144 ETH`.
- `AZUKI x3`: best discount wins, total `60 ETH`.
- `MEEBIT x3`: no discount, total `12 ETH`.

Unknown product codes throw an error. Removing a valid product that is not in the cart is treated as a no-op.

## Public API

```typescript
import { createDefaultCheckout } from './src/index.js';

const checkout = createDefaultCheckout();

checkout.scan('APE');
checkout.scan('APE');
checkout.scan('PUNK');
checkout.remove('APE');

console.log(checkout.total());
console.log(checkout.summary());
```

`summary()` returns regular totals, applied discounts, final totals, and per-product lines. The CLI uses this method to display discount details without duplicating pricing logic.

## Setup

Use Node `24` as specified in `.nvmrc`.

```bash
nvm use
pnpm install
```

## Commands

```bash
pnpm start
```

Runs the interactive checkout simulator. It lets you scan items, remove items, view the cart, and view a total breakdown with regular price, applied discounts, and final total.

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm format:check
```

Runs tests, ESLint, TypeScript checks, and Prettier validation.

## Simulator

Start the simulator with:

```bash
pnpm start
```

Available actions:

- `Scan item`: add one product to the cart.
- `Remove item`: remove one product from the cart.
- `View cart`: show current quantities.
- `View total breakdown`: show regular totals, discounts applied, and final total.
- `Exit`: close the simulator.

The simulator is only an input/output adapter. It does not calculate prices or discounts directly.

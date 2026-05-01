# Implementation Notes

## Architecture

The implementation uses a lightweight Clean Architecture split:

- `src/domain/` contains product types, discount rules, and price provider contracts.
- `src/application/` contains `Checkout`, the use case exposed by the challenge.
- `src/infrastructure/` contains the mocked external price source.

The project avoids empty layers and only introduces abstractions used by the checkout flow.

## Discount Decisions

`AZUKI` qualifies for both promotions. Discounts are not stacked; each applicable rule is calculated independently and the checkout uses the best subtotal for that product. With this policy, `AZUKI, AZUKI, AZUKI` totals `60 ETH`.

`remove(productCode)` removes one unit from the cart. Removing a valid product that is not present is a no-op. Unknown product codes throw an error for both `scan` and `remove`.

## Price Source

Prices are provided through the `PriceProvider` contract and the `MockPriceProvider` adapter. It is synchronous to keep the public API aligned with the challenge example, where `total()` returns a number directly.

## Interactive CLI

`pnpm start` runs an interactive checkout simulator. It uses `@inquirer/prompts` only as an input/output adapter and delegates cart operations, totals, and discount breakdowns to `Checkout`.

`Checkout.summary()` exposes regular totals, applied discounts, and final totals so the CLI can display pricing details without duplicating discount logic.

CLI rendering is isolated in `src/cli-renderer.ts` so colors and tables stay outside the checkout logic.

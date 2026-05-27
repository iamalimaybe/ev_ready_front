# EVReady Pakistan

EVReady Pakistan is a free Pakistan-focused EV savings and charging-cost utility for bikes and cars.

The product helps people in Pakistan estimate whether switching from petrol to an EV bike or EV car can save money and make practical ownership sense.

## First Release Scope

This frontend repo remains:

- React
- Vite
- TypeScript
- Tailwind CSS

First release now expects a separate backend repo for shared data and submissions:

- Vehicle Catalog data from backend APIs
- Charger Directory data from backend APIs
- Get Help / lead capture submissions stored through backend
- Calculators can remain frontend-side where users enter values manually
- Backend data may initially be managed through DB seed/manual data entry
- No authentication
- No payment flow
- No charger booking
- No external map API
- No OEM vehicle integration
- No admin UI required for the first backend release unless planned later

## Current Implemented Tools

1. EV vs petrol monthly cost comparison
2. EV Bike Savings Calculator
3. Home Charging Cost Estimator
4. Solar EV Charging Estimator
5. EV car suitability / ownership fit calculator
6. Route feasibility estimator
7. Vehicle catalog, currently using local sample data until backend integration
8. Charger directory, currently using local sample data until backend integration
9. Static guides/content
10. Lead capture placeholder CTA

Cost Comparison now uses manual Bike/Car inputs instead of selecting vehicles from the catalog.
Vehicle, charger, and lead data should move to backend APIs before the first backend-backed release.
After backend integration, demo-data UI wording should be replaced with verify-before-purchase/travel guidance.

## Planned Next Work

1. Integrate backend APIs for Vehicle Catalog, Charger Directory, and Get Help lead submission.
2. Plan backend/data flow details in the separate backend repo and docs.
3. Plan charger data collection, verification, update, and feedback strategy.
4. Defer vehicle ratings and reviews until after first release and backend persistence/moderation.

## Product Principles

- Help users understand whether switching from petrol to EV fits their real life and budget.
- Use Pakistan-specific assumptions and examples.
- Clearly label estimates and unverifiable data.
- Keep the experience lightweight and fast.
- Avoid over-building before the MVP is validated.
- Keep the product free for users, with future monetization through ads, sponsored placements, and qualified leads.

## Documentation

- [Product Spec](docs/PRODUCT_SPEC.md)
- [Codex Tasks](docs/CODEX_TASKS.md)
- [Decisions](docs/DECISIONS.md)
- [Agent Guidance](AGENTS.md)

## Development

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Deployment Notes

Production frontend configuration should come from deployment environment variables. `VITE_*`
variables are bundled into the frontend output, so they must never contain secrets. Deploy only the
Vite build output, such as `dist/`, and do not expose the full repository as a public web directory.

## Development Status

The React + Vite + TypeScript + Tailwind CSS frontend MVP is in place with calculator pages, guides, and supporting catalog/directory pages. Local sample data remains in the frontend until backend APIs are integrated. The next product milestone is connecting Vehicle Catalog, Charger Directory, and Get Help lead submission to the separate backend repo.

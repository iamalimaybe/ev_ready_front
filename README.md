# EVReady Pakistan

EVReady Pakistan is a free Pakistan-focused EV savings and charging-cost utility for bikes and cars.

The product helps people in Pakistan estimate whether switching from petrol to an EV bike or EV car can save money and make practical ownership sense.

## First Release Scope

This frontend repo remains:

- React
- Vite
- TypeScript
- Tailwind CSS

The deployed production frontend integrates with the separate backend repo for shared data and
submissions:

- Vehicle Catalog data from backend APIs
- Charger Directory data from backend APIs
- Charger city and charger type options from backend APIs
- Get Help / lead capture submissions stored through backend
- Contact Us submissions stored through backend
- Internal protected read-only admin visibility for leads and contact submissions
- Calculators can remain frontend-side where users enter values manually
- Backend data may initially be managed through DB seed/manual data entry
- No public user authentication
- No payment flow
- No charger booking
- No external map API
- No OEM vehicle integration
- No public admin links or broad data-management UI

## Current Implemented Tools

1. EV vs petrol monthly cost comparison
2. EV Bike Savings Calculator
3. Home Charging Cost Estimator
4. Solar EV Charging Estimator
5. EV car suitability / ownership fit calculator
6. Route feasibility estimator
7. Vehicle catalog using backend vehicle data
8. Charger directory using backend charger data and backend city/type options
9. Static guides/content
10. Get Help lead capture submission
11. Contact Us submission
12. Internal read-only admin view for leads and contact submissions

Cost Comparison now uses manual Bike/Car inputs instead of selecting vehicles from the catalog.
Vehicle, charger, Get Help, and Contact Us flows are backend-backed in production. Catalog and
directory wording should continue to ask users to verify vehicle details before purchase and charger
details before travel.

## Planned Next Work

1. Plan expanded admin and data-management needs in the backend repo before adding broader admin
   capabilities.
2. Plan charger data collection, source confidence, update cadence, and feedback strategy.
3. Keep ratings and reviews deferred until persistence, moderation, and spam handling are planned.
4. Keep public calculators frontend-side where users manually enter assumptions.

## Product Principles

- Help users understand whether switching from petrol to EV fits their real life and budget.
- Use Pakistan-specific assumptions and examples.
- Clearly label estimates and unverifiable data.
- Keep the experience lightweight and fast.
- Avoid over-building before the MVP is validated.
- Keep the product free for users, with future monetization through ads, sponsored placements, and qualified leads.

## Documentation

- [Product Spec](docs/PRODUCT_SPEC.md)
- [Decisions](docs/DECISIONS.md)

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

## Branch Strategy

- `main` is the production-ready branch.
- `develop` is the integration/testing branch.
- All future work should use short-lived `feature/*` branches created from `develop`.
- Pull request flow:
  - `feature/*` -> `develop`
  - `develop` -> `main` for production deployment
- Avoid committing directly to `main` after initial setup.
- Keep deployment-related work in focused feature branches, for example:
  - `feature/deployment-plan`
  - `feature/docker-deployment`
  - `feature/frontend-prod-config`

## Deployment Notes

Production frontend configuration should come from deployment environment variables. `VITE_*`
variables are bundled into the frontend output, so they must never contain secrets. Deploy only the
Vite build output, such as `dist/`, and do not expose the full repository as a public web directory.

## Technical SEO

The frontend includes default metadata in `index.html`, plus static `robots.txt` and `sitemap.xml`
assets served from Vite's `public/` folder. This is a lightweight SEO foundation only; the app does
not use SSR or prerendering yet. Google Search Console and Bing Webmaster Tools setup are external,
manual follow-up steps after deployment.

## Production Deployment

The production frontend is live at `https://evready.pk` and uses the production API at
`https://api.evready.pk`. The frontend production build is created with
`VITE_API_BASE_URL=https://api.evready.pk`; because Vite bundles `VITE_*` values into the frontend
output, these values must never contain secrets.

The frontend repo is deployed from `main` on the Hetzner VPS through Docker Compose. The frontend
container is bound to `127.0.0.1:3000`, and Caddy serves public HTTPS for `evready.pk` while reverse
proxying to that local frontend container. `www.evready.pk` redirects to `evready.pk`, with DNS
managed through Cloudflare. The fuller backend, database, and server deployment runbook lives in the
backend repo docs.

Redeploy reminder:

- Keep the production VPS clone on `main`.
- After pulling new `main` changes, rebuild the frontend container.
- Verify `https://evready.pk` and API-backed pages after redeploy.

For the production VPS build, set the frontend API URL to `https://api.evready.pk` through the
Docker build argument or `.env.prod` file:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

The included production compose file serves the built frontend through Nginx and binds it only to
`127.0.0.1:3000`. Public access to `https://evready.pk` is handled by the VPS Caddy reverse proxy.

## Development Status

The React + Vite + TypeScript + Tailwind CSS frontend is deployed at `https://evready.pk` and uses
the production API at `https://api.evready.pk`. Vehicle Catalog, Charger Directory, Get Help, and
Contact Us are backend-backed in production. Frontend trust wording, technical SEO, Cloudflare Web
Analytics, copy/share summaries for calculators and estimators, and a minimal protected read-only
Admin UI for lead/contact visibility are complete. The next planning direction is expanded
admin/data-management strategy and charger data strategy.

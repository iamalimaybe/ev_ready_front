# EVReady Pakistan

EVReady Pakistan is a free Pakistan-focused EV savings and charging-cost utility for bikes and cars.

The product helps people in Pakistan estimate whether switching from petrol to an EV bike or EV car can save money and make practical ownership sense.

The frontend is built as a lightweight public utility with calculators, catalogue browsing, charger information, guides, lead capture, contact submissions, and protected internal admin screens.

## Tech Stack

* React
* Vite
* TypeScript
* Tailwind CSS
* React Router
* Docker
* Nginx for production container serving

## Product Direction

EVReady Pakistan is intended to be:

* A free public EV decision utility
* Pakistan-focused
* Useful for both EV bikes and EV cars
* Practical for first-time EV buyers
* Clear about estimates, assumptions, and data uncertainty
* Lightweight instead of a heavy SaaS product

The product is not intended to be:

* A paid user subscription product
* A booking platform
* A payment platform
* A live charger availability system
* A dealer-management platform
* A guarantee of vehicle prices, specs, charger status, or route feasibility

## Current Implemented Tools

Public frontend tools include:

1. EV vs petrol monthly cost comparison
2. EV Bike Savings Calculator
3. Home Charging Cost Estimator
4. Solar EV Charging Estimator
5. EV car suitability and ownership fit calculator
6. Route feasibility estimator
7. EV Catalogue using backend vehicle data
8. Charger Directory using backend charger data and backend city/type options
9. Dedicated EV detail pages
10. Dedicated charger detail pages
11. Public vehicle review submission
12. Approved-only public vehicle review display
13. Public charger feedback submission
14. Approved-only public charger feedback display
15. Static guides/content pages
16. Get Help lead capture submission
17. Contact Us submission
18. Protected internal admin dashboard

The calculators remain frontend-side where users manually enter assumptions.

Backend-backed flows include:

* Vehicle data
* Charger data
* Brand options
* Charger city options
* Charger type options
* Get Help submissions
* Contact Us submissions
* Vehicle review submissions
* Approved vehicle reviews
* Charger feedback submissions
* Approved charger feedback
* Protected admin workflows

## Admin UI Scope

The frontend includes protected internal admin screens for operational review and data-management workflows.

Implemented admin areas include:

* Lead/contact visibility
* Lead/contact status updates
* Vehicle review moderation
* Charger feedback moderation
* EV catalogue record management
* Charger directory record management

Admin routes are not shown in public navigation. Admin API access is handled by the backend through protected session-based endpoints.

The admin UI is intentionally focused. It does not include payments, bookings, public user accounts, CRM pipelines, bulk exports, or advanced role management.

## Data Trust And Safety Rules

EVReady uses source-confidence and moderation language carefully.

### Vehicle Data

Vehicle catalogue data should be treated as useful decision-support information, not a guarantee.

Users should still verify:

* Price
* Specs
* Range
* Battery capacity
* Warranty
* Dealer availability
* Booking status

Source-confidence labels describe data source confidence. They do not mean EVReady physically audited or field-verified every vehicle.

### Charger Data

Charger information is not live availability.

Users should verify before travel:

* Charger access
* Connector compatibility
* Pricing
* Operating status
* Availability
* Location accuracy

Reported charger status should not be treated as proof that a charger is working, available, unoccupied, compatible, or priced as shown at the time of travel.

### Reviews And Feedback

Vehicle reviews and charger feedback are user-submitted and moderated before public display.

* Pending content is not shown publicly.
* Rejected or spam content is not shown publicly.
* Approved vehicle reviews may contribute to visible rating summaries.
* Charger feedback does not automatically update public charger status.
* Public feedback does not mean EVReady verified every user claim.

## API Integration

The deployed frontend consumes the separate EVReady backend API.

Production frontend:

```text
https://evready.pk
```

Production API:

```text
https://api.evready.pk
```

Frontend API configuration uses:

```text
VITE_API_BASE_URL
```

For production builds:

```text
VITE_API_BASE_URL=https://api.evready.pk
```

`VITE_*` variables are bundled into frontend output and must never contain secrets.

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

## Environment Variables

Example frontend environment variable:

```text
VITE_API_BASE_URL=http://localhost:8080
```

Production value:

```text
VITE_API_BASE_URL=https://api.evready.pk
```

Do not put secrets in frontend environment variables. Anything exposed through `VITE_*` can be visible in the browser bundle.

## Production Deployment

The frontend is deployed separately from the backend.

Current production shape:

```text
Frontend: https://evready.pk
API: https://api.evready.pk
```

The production frontend build is served through a Docker/Nginx container. Public HTTPS and reverse proxy handling are managed outside the app container.

The production deployment should publish only the built frontend output, not the full repository as a public web directory.

Production build/deploy example:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Redeploy reminder:

* Keep production deployment based on `main`.
* Merge feature work through the normal branch flow.
* Pull latest `main` on the VPS.
* Rebuild the frontend container.
* Verify public pages and API-backed pages after deployment.

## Technical SEO

The frontend includes a lightweight static SEO foundation:

* Default metadata in `index.html`
* Open Graph metadata
* Twitter preview metadata
* Minimal WebSite JSON-LD
* Static `robots.txt`
* Static `sitemap.xml`

The app does not currently use SSR or prerendering.

Google Search Console and Bing Webmaster Tools setup are external/manual follow-up steps.

SEO metadata must avoid claims about:

* Live charger availability
* Complete market coverage
* Guaranteed prices
* Guaranteed vehicle specs
* Guaranteed route feasibility
* Official ratings
* Guaranteed SEO outcomes

## Branch Strategy

* `main` is the production-ready branch.
* `develop` is the integration/testing branch.
* Feature work should use short-lived `feature/*` branches created from `develop`.
* Pull request flow:

  * `feature/*` to `develop`
  * `develop` to `main` for production deployment
* Avoid committing directly to `main`.
* Avoid committing directly to `develop` unless intentionally handling integration work.

## Documentation

Additional project documentation:

```text
docs/PRODUCT_SPEC.md
docs/DECISIONS.md
docs/MVP_REVIEW_CHECKLIST.md
```

Recommended reading order:

1. `docs/PRODUCT_SPEC.md`
2. `docs/DECISIONS.md`
3. `docs/MVP_REVIEW_CHECKLIST.md`

## Product Principles

* Help users understand EV ownership cost and practicality.
* Keep the product free for users.
* Use Pakistan-specific assumptions and examples.
* Clearly label estimates and uncertain data.
* Avoid fake precision.
* Avoid fake reviews, fake ratings, or fake charger reliability claims.
* Keep calculator assumptions visible.
* Keep public flows lightweight and understandable.
* Keep charger information cautious unless reliable live integrations are added.
* Keep monetization future-facing through ads, sponsored placements, and qualified leads, not paid subscriptions for normal users.

## Security And Privacy Notes

* Do not commit real secrets.
* Do not expose admin links in public navigation.
* Do not store admin credentials in browser storage.
* Do not put secrets in `VITE_*` variables.
* Do not publish the full repository as a public web directory.
* Treat lead/contact data as sensitive operational data.
* Keep public forms clear about consent and submission purpose.
* Keep production CORS and backend access rules controlled in the backend.

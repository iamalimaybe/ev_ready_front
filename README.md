# EVReady Pakistan

EVReady Pakistan is a free Pakistan-focused EV savings and charging-cost utility for bikes and cars.

The product helps people in Pakistan estimate whether switching from petrol to an EV bike or EV car can save money and make practical ownership sense.

The frontend is built as a lightweight public utility with calculators, catalogue browsing, charger information, guides, lead capture, contact submissions, AI-assisted recommendation support, and protected internal admin screens.

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
* A guarantee of vehicle prices, specs, charger status, route feasibility, or AI recommendation accuracy

## Current Implemented Tools

Public frontend tools include:

1. EV vs petrol monthly cost comparison
2. EV Bike Savings Calculator
3. Home Charging Cost Estimator
4. Solar EV Charging Estimator
5. EV car suitability and ownership fit calculator
6. AI EV Recommendation page using backend gateway routing and async recommender polling
7. Route feasibility estimator
8. EV Catalogue using backend vehicle data
9. Charger Directory using backend charger data and backend city/type options
10. Dedicated EV detail pages
11. Dedicated charger detail pages
12. Public vehicle review submission
13. Approved-only public vehicle review display
14. Public charger feedback submission
15. Approved-only public charger feedback display
16. Static guides/content pages
17. Get Help lead capture submission
18. Contact Us submission
19. Protected internal admin dashboard

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
* AI recommendation requests through the existing EVReady backend gateway

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

### AI Recommendations

AI recommendation results are decision-support only.

The AI recommender should stay grounded in trusted EVReady catalogue data. It should not invent vehicle records, prices, ranges, battery values, charger availability, dealer stock, route feasibility, booking availability, or field-verification claims.

Users should still verify:

* Vehicle price
* Vehicle specs
* Warranty
* Dealer availability
* Charger access
* Connector compatibility
* Route distance
* Charger status before intercity travel

The recommendation page uses an async flow. It creates a recommendation run, polls for the stored result, and displays warnings when data is uncertain.

The frontend supports backend gateway routing so the browser does not need to call the recommender service directly in production-shaped usage.

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

### AI Recommendation API Routing

The recommendation page supports two routing modes.

Default mode uses the existing EVReady backend gateway:

```text
Frontend -> EVReady Backend -> AI Recommender Service -> Ollama
```

This is the production-safe path because the browser does not call the recommender service directly.

When `VITE_RECOMMENDER_API_BASE_URL` is not set, the frontend uses:

```text
VITE_API_BASE_URL
```

and calls the backend gateway endpoints:

```text
POST /api/v1/ai/recommendations
GET /api/v1/ai/recommendations/{id}
GET /api/v1/ai/recommendations/health
```

Local direct recommender mode is available only when explicitly configured:

```text
VITE_RECOMMENDER_API_BASE_URL=http://localhost:8081
```

When this variable is set, the frontend calls the recommender service directly for local development:

```text
Frontend -> AI Recommender Service -> Ollama
```

The direct recommender service endpoints are:

```text
POST /api/v1/recommendations
GET /api/v1/recommendations/{id}
GET /actuator/health
```

`VITE_RECOMMENDER_API_BASE_URL` should not be used for production builds.

The AI recommender API is asynchronous. The page submits a recommendation request, receives a queued run ID, then polls the stored recommendation until it reaches a final status.

Expected recommendation flow:

```text
POST recommendation request -> QUEUED
GET recommendation run by ID -> QUEUED, RUNNING, ANSWERED, FAILED, TIMED_OUT, etc.
```

The page stores only the active in-progress recommendation ID in browser localStorage so a refresh can resume polling. It clears the stored item when a final status is reached, and also uses an expiry to avoid stale local states.

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

For local recommendation page development through the backend gateway:

```powershell
$env:VITE_API_BASE_URL="http://localhost:8080"
Remove-Item Env:\VITE_RECOMMENDER_API_BASE_URL -ErrorAction SilentlyContinue
npm run dev
```

For direct recommender service testing only:

```powershell
$env:VITE_API_BASE_URL="http://localhost:8080"
$env:VITE_RECOMMENDER_API_BASE_URL="http://localhost:8081"
npm run dev
```

Expected local services for the recommendation page in gateway mode:

```text
EVReady backend: http://localhost:8080
EVReady AI Recommender Service: http://localhost:8081
Ollama: http://localhost:11434
Frontend dev server: http://localhost:5173
```

Gateway mode request path:

```text
Frontend: http://localhost:5173
  -> EVReady backend: http://localhost:8080
  -> AI Recommender Service: http://localhost:8081
  -> Ollama: http://localhost:11434
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

Optional local-only direct AI recommender variable:

```text
VITE_RECOMMENDER_API_BASE_URL=http://localhost:8081
```

`VITE_RECOMMENDER_API_BASE_URL` is for local AI recommender service testing only. Do not use it for production builds.

Do not put secrets in frontend environment variables. Anything exposed through `VITE_*` can be visible in the browser bundle.

## CI

GitHub Actions runs the frontend build workflow for pushes and pull requests.

Current CI check:

```text
Build and test
```

The workflow installs dependencies with npm ci and verifies the production build with:

```powershell
npm run build
```

This check is required by the repository branch rules before protected branches can be updated.

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
* Guaranteed AI recommendation accuracy
* Guaranteed SEO outcomes

## Branch Strategy

* `main` is the production-ready branch.
* `develop` is the integration/testing branch.
* Feature work should use short-lived `feature/*` branches created from `develop`.
* Pull request flow:

  * `feature/*` to `develop`
  * `develop` to `main` for production deployment

Avoid committing directly to `main`.

Avoid committing directly to `develop` unless intentionally handling integration work.

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
* Keep AI recommendations grounded in catalogue data and clear about uncertainty.
* Keep monetization future-facing through ads, sponsored placements, and qualified leads, not paid subscriptions for normal users.

## Security And Privacy Notes

* Do not commit real secrets.
* Do not expose admin links in public navigation.
* Do not store admin credentials in browser storage.
* Do not put secrets in `VITE_*` variables.
* Do not expose the AI recommender service as an unrestricted public model-generation endpoint.
* Use backend-side controls for production AI recommendation access, rate limits, and abuse protection.
* Route production AI recommendation access through the existing backend gateway or another controlled backend boundary.
* Do not publish the full repository as a public web directory.
* Treat lead/contact data as sensitive operational data.
* Keep public forms clear about consent and submission purpose.
* Keep production CORS and backend access rules controlled in the backend.

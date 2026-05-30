# Codex Tasks

This file tracks completed and upcoming implementation tasks. Codex must update it after each meaningful task.

## Current Status

- Initial project guidance files created.
- Frontend scaffold created with React, Vite, TypeScript, Tailwind CSS, and React Router.
- Local route city-pair estimates and calculator utility functions are available.
- Suitability Calculator form UI is available.
- Solar availability now affects suitability scoring without changing monthly EV cost.
- Route Feasibility form UI is available.
- Route Feasibility validates battery reserve inputs and prevents same-city routes.
- Vehicle Catalog page is available.
- Charger Directory page is available.
- Cost Comparison page is available.
- Home page now guides users to the core MVP tools.
- MVP validation now prevents broken numeric outputs and clarifies extra monthly cost cases.
- Critical validation bug fix prevents invalid calculator result rendering.
- MVP review checklist is available.
- Product direction is now a free Pakistan-focused EV savings and charging-cost utility for bikes and cars.
- EV Bike Savings Calculator is available.
- Home Charging Cost Estimator is available.
- Solar EV Charging Estimator is available.
- EV Bike Savings Calculator can copy a plain-text result summary.
- Static guide/content pages are available.
- Main navigation is grouped to avoid horizontal scrolling as pages are added.
- Navbar dropdown behavior now keeps only one grouped menu open and makes Guides a direct link.
- Calculator two-column layouts no longer stretch form columns to match taller result cards.
- Get Help lead capture page is available and submits public requests through the backend API.
- Existing pages now clarify bike-focused, car-focused, general, and supporting tool roles.
- Cost Comparison now uses manual bike/car inputs instead of a catalog vehicle selector.
- Calculator labels, helper text, validation headings, and result explanations are clearer for
  layman Pakistani users.
- Vehicle Catalog supports Bike/Car category filtering and price/range filters without ratings or
  reviews.
- Production now integrates with the separate backend repo for vehicle data, charger data, Get Help
  lead capture submissions, and Contact Us submissions.
- Calculators can remain frontend-side where users manually enter values.
- Frontend API base URL config and a reusable typed GET/POST helper are available.
- Vehicle Catalog now loads active vehicle records from the separate backend API.
- Suitability Calculator now loads EV car options from the separate backend vehicle API.
- Route Feasibility now loads EV car options from the separate backend vehicle API while keeping
  route city-pair data local.
- Charger Directory now loads active charger records from the separate backend API.
- Charger Directory now loads active charger types from the backend for charger type filtering.
- Get Help lead submission now posts public requests to the separate backend API.
- Charger Directory now loads city filter options from the backend charger city list.
- Vehicle Catalog now loads brand filter options from the backend brand API and filters vehicles by
  `brandId`.
- Backend vehicle responses are normalized before rendering so nested brand and charger type records
  do not break catalog or calculator pages.
- Vehicle Catalog now paginates the filtered and sorted frontend vehicle list.
- Vehicle Catalog now shows source-confidence verification badges on vehicle cards.
- Charger Directory now paginates the loaded charger list after filters and shows
  source-confidence verification badges on charger cards.
- Charger Directory cards now avoid empty field boxes, format charger power and AC/DC labels
  cleanly, and show map links when coordinates are available.
- Charger Directory now normalizes valid latitude/longitude values per charger before rendering
  map links so all paginated charger cards with coordinates show `Open in Maps`.
- Charger Directory cards now map backend `name`, `area`, and `address` fields correctly instead
  of relying on a non-existent `locationName` field.
- Contact Us page and site footer are available.
- First-release backend API integration is complete for Vehicle Catalog, Charger Directory, and Get
  Help lead submission; future expanded admin, ratings/reviews, and charger feedback work remains
  deferred.
- Git ignore rules now keep local env files, generated frontend output, logs, dependency folders,
  OS files, and IDE files out of Git while keeping project documentation tracked.
- Obsolete frontend dummy vehicle and charger records have been removed now that catalog and
  directory data load from backend APIs.
- Frontend trust wording now frames EVReady Pakistan as a free Pakistan-focused EV savings and
  decision utility, treats source-confidence badges as data-source labels rather than field
  verification, clarifies charger status as non-live, and avoids guaranteed follow-up wording in
  Get Help.
- Frontend technical SEO foundation now includes truthful default metadata, Open Graph/Twitter
  preview metadata, minimal WebSite JSON-LD, and static `robots.txt` plus `sitemap.xml` assets.
- Cloudflare Web Analytics loads only in production mode, so local Vite dev does not request the
  Cloudflare beacon script.
- Cost Comparison and Home Charging Cost Estimator can now copy plain-text estimate summaries.
- Solar EV Charging Estimator, Suitability Calculator, and Route Feasibility can now copy
  plain-text estimate summaries.
- Frontend documentation now reflects the deployed production state with backend-backed catalog,
  charger directory, Get Help, and Contact Us flows.
- Minimal protected read-only Admin UI is available for internal lead/contact visibility.
- Admin leads and contact submissions can now update status from the protected Admin UI.
- Admin lead status dropdown options now load from the protected backend status-options endpoint.
- Admin contact status dropdown options now load from the protected backend status-options endpoint.
- Dedicated Vehicle Detail and Charger Detail pages now load backend detail APIs from
  `/api/v1/vehicles/{id}` and `/api/v1/chargers/{id}`, with listing card links and conservative
  source-confidence warnings.
- Vehicle Detail now includes a public review submission form backed by pending-review backend
  APIs, while public user auth remains deferred.
- Admin Dashboard now includes protected vehicle review moderation for pending/approved review
  workflows.
- Vehicle Catalog and Vehicle Detail now show approved-only vehicle rating aggregates, and Vehicle
  Detail shows paginated approved public reviews without exposing pending or rejected review content.
- Public navigation now uses mobile-collapsed menus, public listing pages use URL-preserved
  load-more browsing, and Vehicle Detail puts review submission access before approved review
  browsing.
- Vehicle and charger detail back navigation now renders as title-row button actions, and vehicle
  rating aggregate normalization supports nested backend aggregate payloads.
- Vehicle rating and review actions now use stable detail-page anchors so catalog rating CTAs can
  open approved reviews or the review form directly.
- Vehicle rating/review controls now align with source-confidence badge rows on catalog cards and
  vehicle details, with no passive first-review text on Vehicle Detail.
- Public Home and listing UI now use `EV Catalogue` wording instead of `Vehicle Catalog`.
- Charger Detail now includes a public pending-feedback form backed by backend charger feedback
  type options and submission APIs, without public feedback display or charger status updates.

## Completed

### 2026-05-30 - Charger Detail Public Feedback Submission

Added a focused public charger feedback form to the Charger Detail page only. The page now loads
backend charger feedback type options from `GET /api/v1/chargers/feedback-types`, supports optional
ratings, posts feedback to `POST /api/v1/chargers/{chargerId}/feedback`, shows backend validation
errors where possible, and displays a pending-review success message without showing public
feedback, rating aggregates, or changing charger status.

Fixed the optional rating validation type narrowing so the frontend TypeScript build can verify
that blank ratings are allowed while selected ratings are checked from 1 to 5.

Changed files:

- `docs/CODEX_TASKS.md`
- `docs/PRODUCT_SPEC.md`
- `src/pages/ChargerDetail.tsx`
- `src/utils/api.ts`

### 2026-05-29 - EV Catalogue Public Wording Cleanup

Renamed remaining public Home and catalogue-page user-facing `Vehicle Catalog` wording to
`EV Catalogue` without changing routes, backend API paths, filters, or listing behavior.

Changed files:

- `docs/CODEX_TASKS.md`
- `src/pages/Home.tsx`
- `src/pages/VehicleCatalog.tsx`

### 2026-05-29 - Vehicle Rating Row Alignment Cleanup

Aligned Vehicle Detail source-confidence, optional rating summary, and `Write a Review` action into
one responsive row below the title. Detail pages with no approved ratings no longer show passive
`Be the first to review` text because the review button is already present. Vehicle Catalog cards
now align the source-confidence badge and clickable rating/first-review CTA on the same responsive
row while preserving existing detail links, anchors, filters, and load-more behavior.

Changed files:

- `docs/CODEX_TASKS.md`
- `src/pages/VehicleCatalog.tsx`
- `src/pages/VehicleDetail.tsx`

### 2026-05-29 - Vehicle Rating and Review Interaction Polish

Moved the Vehicle Detail `Write a Review` action into the main detail card header area so it aligns
with the vehicle summary on desktop and stacks cleanly on mobile. Added stable `#write-review` and
`#reviews` anchors with hash scrolling after detail content renders. Vehicle Catalog cards now show
the rating summary or `Be the first to review` as clickable header actions on the right side when
space allows, linking to the approved reviews section or review form respectively while preserving
the existing View details button and listing query state.

Changed files:

- `docs/CODEX_TASKS.md`
- `src/pages/VehicleCatalog.tsx`
- `src/pages/VehicleDetail.tsx`

### 2026-05-29 - Detail Back Button and Vehicle Rating Aggregate Bugfix

Updated Vehicle Detail and Charger Detail back navigation to render as button-style actions in the
page title area while preserving query-string filter return behavior. Vehicle Detail now labels the
return action as `Back to EV Catalogue`. Vehicle rating normalization now reads approved aggregate
values from both flat backend fields and common nested aggregate payloads, so Vehicle Catalog cards
and the Vehicle Detail header can show approved average rating, stars, and count when backend list
or detail responses provide them. No fake ratings, charger ratings, public auth, or backend path
changes were added.

Changed files:

- `docs/CODEX_TASKS.md`
- `src/components/PageShell.tsx`
- `src/data/vehicles.ts`
- `src/pages/ChargerDetail.tsx`
- `src/pages/VehicleDetail.tsx`

### 2026-05-29 - Public Listing and Detail UX Improvements

Updated public navigation labels to `EV & Range Anxiety`, `EV Catalogue`, and `Range Anxiety Check`,
and collapsed the mobile navigation behind a menu button. Added a public go-to-top button outside
admin routes. Vehicle Catalog and Charger Directory now show six cards by default, preserve filters
and visible counts in URL query parameters, carry that query state through detail links, provide
clear filter reset buttons, and use load-more browsing instead of classic pagination. Vehicle
rating aggregate normalization now accepts common
approved-review aggregate field names, and unrated vehicles use a review CTA instead of implying
missing approved ratings. Vehicle Detail now uses five approved reviews per page, exposes a
`Write a Review` jump button, places the submission form before approved reviews, and renders
approved reviews as horizontally scrollable cards.

Changed files:

- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`
- `docs/PRODUCT_SPEC.md`
- `src/components/Layout.tsx`
- `src/data/vehicles.ts`
- `src/pages/ChargerDetail.tsx`
- `src/pages/ChargerDirectory.tsx`
- `src/pages/VehicleCatalog.tsx`
- `src/pages/VehicleDetail.tsx`

### 2026-05-29 - Approved Vehicle Ratings and Reviews Display

Added approved-only vehicle rating aggregate display to Vehicle Catalog cards and Vehicle Detail,
including simple star rendering and no-approved-ratings fallback text. Vehicle Detail now loads
approved public reviews from `GET /api/v1/vehicles/{vehicleId}/reviews?page=0&size=10`, shows
separate loading/error/empty states, renders approved review cards with reviewer fallback text, and
adds simple Previous/Next pagination from the backend page response. Pending submissions remain
moderated and do not appear in the public review list after submit. No public auth, charger reviews,
fake ratings, or unapproved review display were added.

Changed files:

- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`
- `docs/PRODUCT_SPEC.md`
- `src/data/vehicles.ts`
- `src/pages/VehicleCatalog.tsx`
- `src/pages/VehicleDetail.tsx`
- `src/utils/api.ts`

### 2026-05-29 - Admin Vehicle Review Moderation UI

Added protected Admin Dashboard support for vehicle review moderation. Admin users can load
paginated vehicle reviews, default to pending reviews, filter by backend-provided review status and
optional vehicle ID, review submitted fields, enter an optional moderation reason, and update review
status through the session-cookie admin API. Successful updates replace the review in local state
and show a safe message. Public review display, averages, stars, comments, auth changes, charger
feedback, and fake review data were not added.

Changed files:

- `docs/CODEX_TASKS.md`
- `docs/PRODUCT_SPEC.md`
- `src/pages/admin/AdminDashboard.tsx`
- `src/utils/adminApi.ts`

### 2026-05-29 - Vehicle Review Form Wording Cleanup

Removed the extra frontend-appended review moderation sentence so successful vehicle review
submissions show only the backend success message. Renamed the idle submit button label to
`Submit Review` while keeping the existing submitting state, validation, and error handling.

Changed files:

- `docs/CODEX_TASKS.md`
- `src/pages/VehicleDetail.tsx`

### 2026-05-29 - Vehicle Detail Public Review Submission

Added a focused public review submission form to the Vehicle Detail page only. The page now loads
backend vehicle review experience type options, validates rating and experience type before submit,
posts reviews to `POST /api/v1/vehicles/{vehicleId}/reviews`, and shows a moderation/pending
success message without reloading or clearing vehicle details. Public review display, average
ratings, stars, comments, authentication, and charger feedback remain unimplemented.

Changed files:

- `docs/CODEX_TASKS.md`
- `docs/PRODUCT_SPEC.md`
- `src/pages/VehicleDetail.tsx`
- `src/utils/api.ts`

### 2026-05-29 - Vehicle and Charger Detail Pages

Added dedicated public detail routes for backend-backed vehicle and charger records. Vehicle cards
now link to `/vehicles/:id`, charger cards link to `/chargers/:id`, and the new detail pages load
the existing backend detail APIs with loading, error, and not-found states. Detail pages show useful
record fields with source-confidence labels and verify-before-purchase/travel wording, without
ratings, reviews, stars, comments, authentication, or modal review UI.

Changed files:

- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`
- `docs/PRODUCT_SPEC.md`
- `src/main.tsx`
- `src/pages/ChargerDetail.tsx`
- `src/pages/ChargerDirectory.tsx`
- `src/pages/VehicleCatalog.tsx`
- `src/pages/VehicleDetail.tsx`

### 2026-05-28 - Admin Status Option Type Fix

Fixed the Admin Dashboard build error by updating the remaining lead status options generic type
from the removed `LeadStatusOption` name to the shared `StatusOption` type.

Changed files:

- `docs/CODEX_TASKS.md`
- `src/pages/admin/AdminDashboard.tsx`

### 2026-05-28 - Admin Contact Status Updates

Added protected Admin UI support for contact submission status updates using backend-provided
options from `GET /api/v1/admin/contact-submissions/statuses` and updates through
`PATCH /api/v1/admin/contact-submissions/{id}/status`. Contacts remain visible if status options
fail to load, with the status control disabled and a safe message shown.

Changed files:

- `docs/CODEX_TASKS.md`
- `src/pages/admin/AdminDashboard.tsx`
- `src/utils/adminApi.ts`

### 2026-05-28 - Backend-Provided Admin Lead Status Options

Replaced the hardcoded Admin UI lead status option list with protected backend-provided options from
`GET /api/v1/admin/leads/statuses`. Leads still load if status options fail, but the status update
control is disabled with a safe message until options are available. Contact submissions remain
read-only.

Changed files:

- `docs/CODEX_TASKS.md`
- `src/pages/admin/AdminDashboard.tsx`
- `src/utils/adminApi.ts`

### 2026-05-28 - Admin Lead Status Updates

Added protected Admin UI support for updating Get Help lead status through the backend
`PATCH /api/v1/admin/leads/{id}/status` endpoint. Lead rows now show a small status dropdown,
successful updates replace the local row/detail state with the backend response, and failures show a
safe inline error. Contact submissions remain read-only.

Changed files:

- `docs/CODEX_TASKS.md`
- `src/pages/admin/AdminDashboard.tsx`
- `src/utils/adminApi.ts`

### 2026-05-28 - Admin Pre-Deployment Cleanup

Moved Cloudflare Web Analytics from the always-loaded `index.html` snippet to a production-only
loader in `src/main.tsx`, preserving the existing beacon token while avoiding local dev console
noise. Removed the Admin Login page session probe so logout redirects to `/admin/login` without
intentionally calling `/api/v1/admin/auth/me`; direct `/admin` visits still check the admin session.

Changed files:

- `docs/CODEX_TASKS.md`
- `index.html`
- `src/main.tsx`
- `src/pages/admin/AdminLogin.tsx`

### 2026-05-28 - Admin UI TypeScript Build Fix

Fixed the Admin UI build errors by aligning the admin API helper with the existing `ApiError`
constructor shape and reading HTTP status from `error.response.status` in the admin dashboard.

Changed files:

- `docs/CODEX_TASKS.md`
- `src/pages/admin/AdminDashboard.tsx`
- `src/utils/adminApi.ts`

### 2026-05-28 - Minimal Read-Only Admin UI for Leads and Contacts

Added internal admin routes for session-cookie protected sign-in and read-only visibility into Get
Help leads and Contact Us submissions. Admin API requests use credentials without changing public
API behavior, credentials are not stored in browser storage, and the public site navigation remains
unchanged. Documentation now records that broader admin/data-management work remains a future
planning item.

Changed files:

- `README.md`
- `docs/PRODUCT_SPEC.md`
- `docs/DECISIONS.md`
- `docs/CODEX_TASKS.md`
- `src/main.tsx`
- `src/pages/admin/AdminDashboard.tsx`
- `src/pages/admin/AdminLogin.tsx`
- `src/utils/adminApi.ts`

### 2026-05-28 - Frontend Documentation Production Alignment

Aligned frontend documentation with the current deployed production state. README and Product Spec
no longer describe backend API integration as pending, the MVP review checklist now marks completed
production items appropriately while leaving future strategy items unchecked, and the task list now
marks backend integration and copy/share summaries as complete. The next documented direction is
admin/data-management planning and charger data strategy.

Changed files:

- `README.md`
- `docs/PRODUCT_SPEC.md`
- `docs/MVP_REVIEW_CHECKLIST.md`
- `docs/CODEX_TASKS.md`

### 2026-05-28 - Copy Summaries for Remaining Estimators

Added plain-text copy result summaries to Solar EV Charging Estimator, Suitability Calculator, and
Route Feasibility, following the existing calculator copy pattern. Each result card now has a copy
button, success/failure message handling, key user inputs and outputs, and estimate-not-guarantee
wording. No formulas, routes, APIs, dependencies, or shared abstractions were changed.

Changed files:

- `src/pages/SolarEvChargingEstimator.tsx`
- `src/pages/SuitabilityCalculator.tsx`
- `src/pages/RouteFeasibility.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-28 - Copy Summaries for Cost and Home Charging Estimates

Added plain-text copy result summaries to Cost Comparison and Home Charging Cost Estimator,
following the existing EV Bike Savings Calculator pattern. Each result card now has a copy button,
success/failure message handling, key user inputs and outputs, and estimate-not-guarantee wording.
No calculator formulas, routes, APIs, dependencies, or shared abstractions were changed.

Changed files:

- `src/pages/CostComparison.tsx`
- `src/pages/HomeChargingCostEstimator.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-28 - Cloudflare Web Analytics Beacon

Added the Cloudflare Web Analytics JS snippet to `index.html` near the end of the body before the
closing `</body>` tag. No analytics abstraction, dependencies, routes, APIs, sitemap, robots, or
app behavior were changed.

Changed files:

- `index.html`
- `docs/CODEX_TASKS.md`

### 2026-05-28 - Frontend Technical SEO Foundation

Added truthful default SEO metadata to `index.html`, including title, description, canonical URL,
Open Graph metadata, Twitter card metadata, and minimal WebSite JSON-LD without product, pricing,
ratings, live charger availability, or complete-coverage claims. Added static Vite public assets for
`robots.txt` and `sitemap.xml` with current public frontend routes only. Documented that Google
Search Console and Bing Webmaster Tools setup are external/manual follow-up steps, not code changes
in this task.

Changed files:

- `index.html`
- `public/robots.txt`
- `public/sitemap.xml`
- `README.md`
- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`

### 2026-05-28 - Frontend Trust and Source-Confidence Wording Polish

Tightened homepage positioning around EVReady Pakistan as a free Pakistan-focused EV savings and
practical decision utility for bikes and cars. Updated Vehicle Catalog and Charger Directory badge
labels and helper text so source-confidence language does not imply EVReady physically audited
vehicles or chargers. Clarified that charger status is reported/non-live and that users should
verify connector support, pricing, access, and availability before travel. Softened Get Help copy so
submission does not imply a guaranteed callback or service outcome.

Changed files:

- `src/pages/Home.tsx`
- `src/pages/VehicleCatalog.tsx`
- `src/pages/ChargerDirectory.tsx`
- `src/pages/LeadCapturePlaceholder.tsx`
- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`

### 2026-05-28 - Live Frontend Deployment Documentation

Updated README deployment notes with the live frontend URL, production API URL, production
`VITE_API_BASE_URL` build value, Caddy reverse proxy state, Cloudflare/Hetzner context, backend repo
runbook pointer, and a short redeploy reminder for pulling `main`, rebuilding the frontend
container, and verifying the site plus API-backed pages.

Changed files:

- `README.md`
- `docs/CODEX_TASKS.md`

### 2026-05-28 - Frontend Docker Deployment Setup

Added a minimal multi-stage frontend Docker setup that builds the Vite app with
`VITE_API_BASE_URL` and serves `dist` through Nginx. Added local-only production compose binding,
Docker ignore rules, a non-secret production env example, and README deployment notes for the
`https://api.evready.pk` API URL and future reverse proxy/HTTPS exposure.

Changed files:

- `Dockerfile`
- `nginx.conf`
- `.dockerignore`
- `docker-compose.prod.yml`
- `.env.prod.example`
- `.gitignore`
- `README.md`
- `docs/CODEX_TASKS.md`

### 2026-05-27 - README Branch Strategy Documentation

Added a small README branch strategy section documenting `main`, `develop`, short-lived
`feature/*` branches, the PR flow into production, direct-commit guidance for `main`, and example
deployment-related feature branch names.

Changed files:

- `README.md`
- `docs/CODEX_TASKS.md`

### 2026-05-27 - Remove Obsolete Vehicle and Charger Dummy Data

Removed stale frontend dummy vehicle records from `src/data/vehicles.ts` while keeping the reusable
vehicle types and backend normalization helper used by Vehicle Catalog, Suitability Calculator, and
Route Feasibility. Removed the unused dummy charger data file because Charger Directory now relies
on backend API loading, error, and empty states instead of frontend fallback records. Local route
city-pair estimates remain in place because Route Feasibility still uses them.

Changed files:

- `src/data/vehicles.ts`
- `src/data/chargers.ts`
- `docs/CODEX_TASKS.md`

### 2026-05-27 - Private Repo Git Ignore and Deployment Hygiene

Prepared `.gitignore` for private frontend Git usage by ignoring local env files, dependency
folders, build output, coverage, logs, OS files, and IDE files while keeping docs and Markdown files
trackable. Added README deployment notes explaining that production config should use deployment
environment variables, `VITE_*` values are bundled and must not contain secrets, and only the Vite
build output should be published.

Changed files:

- `.gitignore`
- `README.md`
- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`

### 2026-05-27 - Navigation Vehicles and Trips Label Cleanup

Renamed the grouped navbar label from `Travel & Data` to `Vehicles & Trips` so the dropdown better
matches its existing Route Feasibility and Vehicle Catalog links. Dropdown items, routes, styling,
and behavior remain unchanged.

Changed files:

- `src/components/Layout.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-27 - Charger Directory Field Mapping and Map Link Fix

Updated Charger Directory card typing and rendering to match the backend charger response fields.
Cards now use `name` as the title, fall back to `Charger name not listed` only when missing, and
show `address`, then `area`, then `Address not listed` for location text. The existing coordinate
normalization and Google Maps link behavior remains based only on valid latitude/longitude values,
and the card cleanup for power, charging type, notes, and `sourceCheckedAt` remains in place.

Changed files:

- `src/pages/ChargerDirectory.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-27 - Charger Directory Coordinate Map Link Fix

Updated Charger Directory coordinate handling so each backend charger row normalizes optional
`latitude` and `longitude` values before card rendering. The map action now appears for every
paginated charger card with valid coordinates, accepts numbers or numeric strings, rejects missing,
non-finite, or out-of-range values, and opens Google Maps in a new tab with `noopener noreferrer`.

Changed files:

- `src/pages/ChargerDirectory.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-27 - Charger Directory Card Field Cleanup

Cleaned up Charger Directory cards so missing backend values no longer render as empty boxes or
null-looking text. Power now falls back to `Power not listed`, charging type values show clean
`AC`, `DC`, or `AC/DC` labels, `Last verified` only appears when `sourceCheckedAt` is present and
valid, and notes only appear when `priceNote` or `description` has useful text. Charger cards now
also support optional latitude/longitude values and show an `Open in Maps` link when both
coordinates are valid.

Changed files:

- `src/pages/ChargerDirectory.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-27 - Charger Directory Pagination and Verification Badges

Added client-side Charger Directory pagination at 12 chargers per page after the existing loaded
and filtered backend charger list is available. The directory now shows an accurate visible range
summary, Previous/Next controls with first/last page disabling, and resets to page 1 when filters
change or a new charger list loads.

Charger cards now read `verificationStatus` from backend charger records, normalize missing or
unknown values to `UNVERIFIED`, and display a small source-confidence badge separately from the
operational charger `status`. Frontend product notes now mention that vehicle and charger API
responses carry `verificationStatus` for these badges.

Changed files:

- `src/pages/ChargerDirectory.tsx`
- `docs/PRODUCT_SPEC.md`
- `docs/CODEX_TASKS.md`

### 2026-05-27 - Vehicle Catalog Verification Badges

Updated Vehicle Catalog to read the backend `verificationStatus` field, normalize missing or unknown
values to `UNVERIFIED`, and show a small source-confidence badge on each vehicle card. The catalog
warning now keeps the verify-before-purchase guidance and explains that verification labels indicate
source confidence for catalog data.

Changed files:

- `src/pages/VehicleCatalog.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Vehicle Catalog Client-Side Pagination

Added frontend-only pagination to Vehicle Catalog after the existing loaded, filtered, and sorted
vehicle list is prepared. The page now shows 12 vehicles per page, includes Previous/Next controls
with first/last page disabling, resets to page 1 after filter, sort, category, or backend vehicle
list changes, and shows an accurate visible range summary for matching vehicles.

Changed files:

- `src/pages/VehicleCatalog.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Backend Vehicle Response Normalization Fix

Added a small vehicle normalization helper that converts backend vehicle records with nested
`brand` and `chargerType` objects, numeric IDs, backend price/range field names, and `CAR`/`BIKE`
vehicle type values into the frontend `Vehicle` shape. Vehicle Catalog, Suitability Calculator,
and Route Feasibility now normalize API responses before storing them, preventing React from trying
to render the backend `brand` object directly.

Changed files:

- `src/data/vehicles.ts`
- `src/pages/VehicleCatalog.tsx`
- `src/pages/SuitabilityCalculator.tsx`
- `src/pages/RouteFeasibility.tsx`
- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`

### 2026-05-26 - Vehicle Catalog Brand API Filter

Updated Vehicle Catalog so the Brand dropdown loads records from `GET /api/v1/brands`, keeps All
brands available if brand loading fails or returns an empty list, and sends selected brand IDs as
`brandId` to `GET /api/v1/vehicles`. Removed the old brand option derivation and client-side
brand-name filtering from vehicle rows while keeping existing type, price, range, DC fast charging,
and sort behavior in place.

Changed files:

- `src/pages/VehicleCatalog.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Sticky Footer Layout Fix

Updated the shared layout so the app wrapper uses a column flex sticky-footer pattern. Main content
now grows to fill short viewports, keeping the footer at the bottom of short pages while still
placing it below content on longer pages.

Changed files:

- `src/components/Layout.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Charger City Filter, Footer, and Contact Us Page

Updated Charger Directory so the city dropdown loads options from
`GET /api/v1/chargers/cities` instead of deriving them from the current charger list, while keeping
`All cities` usable and leaving charger list loading independent of city option failures. Added a
simple shared footer, a `Contact Us` navigation link, and a `/contact` page that submits inquiry
requests to `POST /api/v1/contact-submissions` with backend field-error and general error handling.

Changed files:

- `src/pages/ChargerDirectory.tsx`
- `src/pages/ContactUs.tsx`
- `src/components/Layout.tsx`
- `src/main.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Suitability Calculator Vehicle API Integration and Help Label Cleanup

Updated Suitability Calculator so the EV car selector loads cars from
`GET /api/v1/vehicles?type=Car` through the shared frontend API client instead of using hardcoded
demo vehicles. EV bikes are no longer included in the selector, the existing suitability calculation
behavior remains in place, and the page now handles vehicle loading, backend error, empty vehicle
list, and normal estimate states without falling back to demo vehicles. Added a direct `Get EV Help`
navigation label for the now-active help request flow.

Changed files:

- `src/pages/SuitabilityCalculator.tsx`
- `src/components/Layout.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Route Feasibility Vehicle API Integration

Updated Route Feasibility so the EV car selector loads cars from `GET /api/v1/vehicles?type=Car`
through the shared frontend API client instead of using hardcoded demo vehicles. EV bikes are no
longer included in the selector, local route city-pair data remains unchanged, and the page now
handles vehicle loading, backend error, empty vehicle list, and normal route estimate states without
falling back to demo vehicles.

Changed files:

- `src/pages/RouteFeasibility.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Backend-Backed Page Wording Cleanup

Cleaned up first-release backend-backed page wording so Vehicle Catalog, Charger Directory, Get
Help, and Home no longer describe integrated catalog/directory/help flows as demo-only or coming
soon. Guidance still tells users to verify vehicle specs, prices, charger details, and availability,
and does not imply complete official data, live charger status, booking, callback, or SLA guarantees.

Changed files:

- `src/pages/Home.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Get Help Field Error Type Fix

Fixed the Get Help form field-error clearing helper so TypeScript only deletes backend request
field keys from the validation error map while keeping the UI-only selected interest option separate.

Changed files:

- `src/pages/LeadCapturePlaceholder.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Get Help Lead Interest Type Payload Fix

Updated the Get Help form so help-type UI labels map to exact backend `LeadInterestType` enum
values in the `interestType` payload field. Multiple user-friendly labels can still map to `OTHER`
without losing the selected label in the UI, and invalid request body errors now include a small
helper to check the selected help type.

Changed files:

- `src/pages/LeadCapturePlaceholder.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Get Help Lead Submission Backend Integration

Replaced the Get Help placeholder form with a public lead submission form that posts to
`POST /api/v1/leads` through the shared frontend API client. The form sends name, phone, city,
interest type, message, stable `sourcePage`, and consent, handles submitting and success states,
maps backend field validation errors onto fields, and shows general backend/network errors.

Changed files:

- `src/pages/LeadCapturePlaceholder.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Charger Directory Status Filter Type Fix

Fixed the Charger Directory status dropdown TypeScript narrowing issue so the backend status filter
value matches the `ChargerStatusFilter` union during builds.

Changed files:

- `src/pages/ChargerDirectory.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Charger Directory Charger Type API Filter

Updated Charger Directory to load active charger types from `GET /api/v1/charger-types`, populate
the charger/connector type filter from those backend records, and send `chargerTypeId` to
`GET /api/v1/chargers` when selected. Charger list loading remains independent, so chargers can
still load if charger types fail, with a non-blocking filter helper message. Get Help integration is
still not completed.

Changed files:

- `src/pages/ChargerDirectory.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Charger Directory Backend API Integration

Updated Charger Directory to use `GET /api/v1/chargers` through the shared frontend API client,
including loading, backend error, empty-list, and normal rendering states. Existing city, charging
type, and status filters are sent as backend query parameters, while connector label filtering stays
client-side because the current UI does not have a safe `chargerTypeId`. Demo charger data remains
in the repo for other pages, and Get Help integration is still not completed.

Changed files:

- `src/pages/ChargerDirectory.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Vehicle Catalog Backend API Integration

Updated Vehicle Catalog to use `GET /api/v1/vehicles` through the shared frontend API client,
including loading, backend error, empty-list, and normal rendering states. Existing catalog filters
and sorting remain available, with supported price, range, DC fast charging, type, and sort values
sent as backend query parameters where the current UI maps cleanly. Demo vehicle data remains in the
repo for other pages, and Charger Directory plus Get Help integration are still not completed.

Changed files:

- `src/pages/VehicleCatalog.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Frontend API Client and Backend Base URL Config

Added a small reusable frontend API helper with `GET` and `POST` support, `VITE_API_BASE_URL`
configuration, a `http://localhost:8080` fallback, and TypeScript types for the shared backend
error envelope and optional field errors. No pages were integrated with backend APIs, and demo data
remains in place.

Changed files:

- `src/vite-env.d.ts`
- `src/utils/api.ts`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - AGENTS Guidance Alignment for Backend-Backed First Release

Updated `AGENTS.md` so Codex guidance reflects the current direction: this remains a React + Vite +
TypeScript + Tailwind frontend repo, while Vehicle Catalog, Charger Directory, and Get Help lead
submission should integrate with the separate backend repo for first release. Manual calculators
remain frontend-side, and backend API integration is still not marked complete.

Changed files:

- `AGENTS.md`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Frontend Docs Update for Backend-Backed First Release

Updated frontend documentation to reflect the new first-release direction: this React frontend will
consume backend APIs from a separate backend repo for Vehicle Catalog, Charger Directory, and Get
Help lead submissions, while manual calculators can remain frontend-side and ratings/reviews stay
deferred.

Changed files:

- `README.md`
- `docs/PRODUCT_SPEC.md`
- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`
- `docs/MVP_REVIEW_CHECKLIST.md`

### 2026-05-26 - Vehicle Catalog Price Filter and Sorting Update

Updated Vehicle Catalog price filtering to use one shared set of price buckets for bikes and cars,
and added sorting by recommended order, price, and practical city range.

Changed files:

- `src/pages/VehicleCatalog.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Vehicle Catalog Bike/Car Segregation and Advanced Filters

Added demo EV bike entries and updated Vehicle Catalog filtering so users can separate EV bikes and
EV cars, filter by body style, brand, price, range, and DC fast charging where useful, with a clearer
demo-data warning and empty state.

Changed files:

- `src/data/vehicles.ts`
- `src/pages/VehicleCatalog.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-26 - Documentation Update for Vehicle Catalog and Future Data Planning

Updated project docs to reflect the implemented EV bike, home charging, solar charging, manual
cost comparison, and readability-pass work, and added upcoming catalog, backend/data flow, reviews,
and charger data strategy tasks.

Changed files:

- `AGENTS.md`
- `README.md`
- `docs/PRODUCT_SPEC.md`
- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`
- `docs/MVP_REVIEW_CHECKLIST.md`

### 2026-05-26 - Layman Readability Pass for Calculator Labels and Helper Text

Updated calculator labels, helper text, validation headings, and result explanations to use simpler
language for normal Pakistani users, including clearer electricity unit, petrol average, battery,
range, estimate, and extra-cost wording.

Changed files:

- `src/pages/CostComparison.tsx`
- `src/pages/EvBikeSavingsCalculator.tsx`
- `src/pages/HomeChargingCostEstimator.tsx`
- `src/pages/SolarEvChargingEstimator.tsx`
- `src/pages/SuitabilityCalculator.tsx`
- `src/pages/RouteFeasibility.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Cost Comparison Bike/Car Manual Input Refactor

Refactored Cost Comparison into a quick manual EV vs petrol comparison for bikes and cars, with vehicle-type defaults, manual battery/range inputs, validation, and no vehicle catalog dependency.

Changed files:

- `src/pages/CostComparison.tsx`
- `src/utils/calculators.ts`
- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`

### 2026-05-25 - Product Alignment Pass for Bike/Car Page Clarity

Updated page copy so older EV car/general tools clearly explain their role alongside EV bike savings, with Home tool categories and clearer catalog/directory notes.

Changed files:

- `src/pages/Home.tsx`
- `src/pages/SuitabilityCalculator.tsx`
- `src/pages/CostComparison.tsx`
- `src/pages/RouteFeasibility.tsx`
- `src/pages/VehicleCatalog.tsx`
- `src/pages/ChargerDirectory.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Lead Capture Placeholder CTA

Added a frontend-only Get EV Help placeholder page and Home page CTA for future EV dealer, charger installer, solar installer, and electrician lead flows without submitting or saving data.

Changed files:

- `src/pages/LeadCapturePlaceholder.tsx`
- `src/main.tsx`
- `src/pages/Home.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Calculator Layout Stretch Fix

Updated calculator two-column layouts so form columns keep natural height while result cards align to the top on desktop and tablet widths.

Changed files:

- `src/pages/SuitabilityCalculator.tsx`
- `src/pages/CostComparison.tsx`
- `src/pages/RouteFeasibility.tsx`
- `src/pages/EvBikeSavingsCalculator.tsx`
- `src/pages/HomeChargingCostEstimator.tsx`
- `src/pages/SolarEvChargingEstimator.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Navbar Dropdown Behavior and Guides Link Fix

Updated grouped navbar behavior so only one dropdown is open at a time, direct links close open menus, Escape and outside clicks close menus, and Guides is a direct top-level link.

Changed files:

- `src/components/Layout.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Main Navigation Grouping Fix

Grouped the main navigation into Savings Tools, Charging Tools, Travel & Data, and Guides so existing routes stay accessible without horizontal scrolling.

Changed files:

- `src/components/Layout.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Static Guide Pages

Added a Guides section with three concise static guide pages for EV bike savings, home charging cost, and solar EV charging, plus routes, navigation link, and Home page card.

Changed files:

- `src/pages/Guides.tsx`
- `src/pages/guides/EvBikeVsPetrolGuide.tsx`
- `src/pages/guides/HomeChargingGuide.tsx`
- `src/pages/guides/SolarEvChargingGuide.tsx`
- `src/main.tsx`
- `src/components/Layout.tsx`
- `src/pages/Home.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Copy Result Summary for EV Bike Savings

Added a copy result summary button to the EV Bike Savings Calculator with clipboard success and fallback messages, plus a concise plain-text summary for sharing.

Changed files:

- `src/pages/EvBikeSavingsCalculator.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Solar EV Charging Estimator

Built a Solar EV Charging Estimator for EV bikes and cars with monthly energy need, solar-covered energy, remaining grid energy, full-grid cost, blended solar/grid cost, savings, validation, route, navigation link, and Home page feature card.

Changed files:

- `src/pages/SolarEvChargingEstimator.tsx`
- `src/utils/calculators.ts`
- `src/main.tsx`
- `src/components/Layout.tsx`
- `src/pages/Home.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Home Charging Cost Estimator

Built a Home Charging Cost Estimator for EV bikes and cars with charging cost, grid energy, charging time, validation, route, navigation link, and Home page feature card.

Changed files:

- `src/pages/HomeChargingCostEstimator.tsx`
- `src/utils/calculators.ts`
- `src/main.tsx`
- `src/components/Layout.tsx`
- `src/pages/Home.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - EV Bike Savings Calculator

Built a dedicated EV Bike Savings Calculator with monthly petrol cost, EV charging cost, savings, full-charge estimates, net upgrade cost, payback period, validation, route, navigation link, and Home page feature card.

Changed files:

- `src/pages/EvBikeSavingsCalculator.tsx`
- `src/utils/calculators.ts`
- `src/main.tsx`
- `src/components/Layout.tsx`
- `src/pages/Home.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Documentation Feature Wording Cleanup

Clarified documentation so implemented tools and planned next-phase tools are separated, and planned EV Bike Savings, Home Charging Cost, and Solar EV Charging features are not described as already built.

Changed files:

- `README.md`
- `docs/PRODUCT_SPEC.md`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Product Direction Update

Updated documentation to reposition EVReady Pakistan as a free Pakistan-focused EV savings and charging-cost utility for bikes and cars, with EV Bike Savings Calculator as the next major feature.

Changed files:

- `README.md`
- `docs/PRODUCT_SPEC.md`
- `docs/DECISIONS.md`
- `docs/CODEX_TASKS.md`
- `docs/MVP_REVIEW_CHECKLIST.md`

### 2026-05-25 - MVP Review Checklist

Created a manual review checklist for validating product positioning, user journey, calculator behavior, route feasibility, catalog and directory filtering, mobile layout, and next phase direction.

Changed files:

- `docs/MVP_REVIEW_CHECKLIST.md`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Critical Calculator Validation Bug Fix

Fixed remaining invalid numeric input handling in Suitability Calculator and Cost Comparison. Validation now lists all invalid fields before rendering results, and formatter fallbacks prevent NaN or Infinity from appearing if a bad value reaches display code.

Changed files:

- `src/utils/calculators.ts`
- `src/pages/SuitabilityCalculator.tsx`
- `src/pages/CostComparison.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - MVP Quality Pass and Validation Review

Improved numeric validation and output safety across calculators, including clean validation messages for invalid inputs, defensive calculator handling for non-finite values, clearer extra-cost wording when EV cost exceeds petrol cost, and continued empty states for filtered catalog and charger results.

Changed files:

- `src/pages/SuitabilityCalculator.tsx`
- `src/pages/CostComparison.tsx`
- `src/utils/calculators.ts`
- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`

### 2026-05-25 - Home Page and Navigation Summary

Improved the Home page with a clear MVP headline, demo-data disclaimer, feature cards linking to all core tools, and a simple usage flow. Updated navbar labels for consistency with page names.

Changed files:

- `src/pages/Home.tsx`
- `src/components/Layout.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Cost Comparison Page

Built a mobile-friendly EV vs petrol cost comparison page using demo vehicle data and existing calculator utilities for monthly EV cost, petrol cost, and savings.

Changed files:

- `src/pages/CostComparison.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Charger Directory Page

Built a responsive charger directory page with demo-data warning, charger cards, and simple filters for city, connector type, charging type, and status.

Changed files:

- `src/pages/ChargerDirectory.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Vehicle Catalog Page

Built a responsive vehicle catalog page with demo-data warning, vehicle cards, and simple filters for vehicle type, brand, and DC fast charging support.

Changed files:

- `src/pages/VehicleCatalog.tsx`
- `docs/CODEX_TASKS.md`

### 2026-05-25 - Route Feasibility Validation and City UX Patch

Patched the Route Feasibility estimator to prevent same-city route selections, auto-correct destination city when needed, show a clean battery validation message, and defensively avoid negative usable range values in calculator utilities.

Changed files:

- `src/pages/RouteFeasibility.tsx`
- `src/utils/calculators.ts`
- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`

### 2026-05-25 - Route Feasibility Form UI

Built a mobile-friendly route feasibility form using demo route and vehicle data, plus utility helpers for bidirectional route matching and trip feasibility verdicts.

Changed files:

- `src/pages/RouteFeasibility.tsx`
- `src/utils/calculators.ts`
- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`

### 2026-05-25 - Solar Available Suitability Fix

Updated the Suitability Calculator so solar availability adds a small capped score bonus and shows a clear note, while monthly EV cost still uses the entered electricity unit price.

Changed files:

- `src/pages/SuitabilityCalculator.tsx`
- `src/utils/calculators.ts`
- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`

### 2026-05-25 - Suitability Calculator Form UI

Built a mobile-friendly suitability calculator form using demo vehicle data and the existing calculator utilities. The result card now shows selected EV, monthly EV cost, monthly petrol cost, estimated savings, suitability score, verdict, and a short verdict explanation.

Changed files:

- `src/pages/SuitabilityCalculator.tsx`
- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`

### 2026-05-25 - Demo Data and Calculator Utilities

Added typed static demo data for vehicles, chargers, and routes, plus pure calculator utility functions for EV cost, petrol cost, monthly savings, and suitability scoring.

Changed files:

- `src/data/vehicles.ts`
- `src/data/chargers.ts`
- `src/data/routes.ts`
- `src/utils/calculators.ts`
- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`

### 2026-05-24 - Frontend Scaffold

Created the root-level frontend app scaffold with basic routing, a simple mobile-friendly layout, and placeholder pages.

Changed files:

- `package.json`
- `.gitignore`
- `index.html`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `postcss.config.js`
- `tailwind.config.js`
- `src/main.tsx`
- `src/vite-env.d.ts`
- `src/App.tsx`
- `src/components/Layout.tsx`
- `src/components/PageShell.tsx`
- `src/pages/Home.tsx`
- `src/pages/SuitabilityCalculator.tsx`
- `src/pages/CostComparison.tsx`
- `src/pages/RouteFeasibility.tsx`
- `src/pages/VehicleCatalog.tsx`
- `src/pages/ChargerDirectory.tsx`
- `src/styles.css`
- `README.md`
- `docs/CODEX_TASKS.md`

### 2026-05-24 - Initial Documentation

Created the initial project guidance and product documentation.

Changed files:

- `AGENTS.md`
- `README.md`
- `docs/PRODUCT_SPEC.md`
- `docs/CODEX_TASKS.md`
- `docs/DECISIONS.md`

## Next Tasks

- [x] Scaffold React + Vite + TypeScript + Tailwind CSS with React Router.
- [x] Add static demo data and calculator utility functions.
- [x] Build Suitability Calculator form UI.
- [x] Build Route Feasibility form UI.
- [x] Build Vehicle Catalog page.
- [x] Build Charger Directory page.
- [x] Build Cost Comparison page.
- [x] Improve Home page and navigation summary.
- [x] MVP quality pass and validation review.
- [x] Prepare MVP review checklist.
- [x] Decide MVP next phase.
- [x] Build EV Bike Savings Calculator
- [x] Build Home Charging Cost Estimator
- [x] Build Solar EV Charging Estimator
- [x] Add Copy Result Summary feature
- [x] Extend copy result summaries to other calculators
- [x] Layman readability pass for calculator labels and helper text
- [x] Add static guide/content pages
- [x] Add lead capture placeholder CTA
- [x] Product alignment pass for bike/car page clarity
- [x] Vehicle Catalog Bike/Car Segregation and Advanced Filters
  - Add bike entries to demo vehicle data.
  - Allow user to select/filter Bike or Car clearly.
  - Keep listings category-aware.
  - Add price filter.
  - Add range filter.
  - Keep existing mobile layout usable.
  - Do not add ratings/reviews in this task.
- [x] Integrate backend APIs for Vehicle Catalog, Charger Directory, and Get Help lead submission
  - [x] Consume vehicle catalog data from the separate backend repo.
  - [x] Consume charger directory data from the separate backend repo.
  - [x] Populate charger type filtering from the separate backend repo.
  - [x] Submit and store Get Help / lead capture requests through backend.
  - [x] Replace demo-data UI wording after backend integration with verify-before-purchase/travel wording.
  - Keep calculators frontend-side where users manually enter values unless a future task changes that.
- [x] Integrate Route Feasibility EV car selector with backend vehicle API
  - Load cars from `GET /api/v1/vehicles?type=Car`.
  - Keep route city-pair data local for now.
  - Do not fall back to demo vehicles on backend failure.
- [x] Integrate Suitability Calculator EV car selector with backend vehicle API
  - Load cars from `GET /api/v1/vehicles?type=Car`.
  - Do not include EV bikes in the selector.
  - Do not fall back to demo vehicles on backend failure.
  - Use `Get EV Help` as the help navigation label.
- [ ] Expanded Admin/Data Management Planning
  - Plan backend admin/data-management approach beyond the current read-only lead/contact view.
  - Define access control, auditability, moderation, and operational ownership before broader admin
    capabilities.
- [ ] Vehicle Ratings and Reviews System
  - Future post-first-release task.
  - Users can rate vehicles from 1 to 5 stars.
  - Users can add text reviews.
  - Listing cards should later show rating count and average rating with max 1 decimal place.
  - Vehicle detail view/modal should later show individual reviews.
  - Requires backend/persistence and should not be built as static fake data for first release.
- [ ] Charger Data Strategy and Feedback Planning
  - Future planning task.
  - Decide how charger data will be collected, verified, updated, and shown without misleading users.
  - Consider user feedback/reporting later, but do not implement now.

## Notes for Future Codex Work

- Keep tasks small and focused.
- Update this file after each completed task.
- Mention changed files in the final response after every task.

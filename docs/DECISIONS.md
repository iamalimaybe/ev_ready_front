# Decisions

This file records product and technical decisions that shape EVReady Pakistan.

## 2026-05-24 - Frontend-Only Prototype

Decision:

- Start with a frontend-only React + Vite + TypeScript + Tailwind CSS prototype.

Reason:

- The MVP should validate user value before adding backend complexity.

Implications:

- Use static demo data.
- Do not add authentication, payments, booking, map APIs, or OEM integrations in phase 1.
- Keep replacement paths open for real data later.

Status:

- Superseded for first release by the 2026-05-26 backend-backed first release decision.

## 2026-05-24 - Confidence Product, Not Charger Map

Decision:

- Position EVReady Pakistan around EV buying and usage confidence, not only charger discovery.

Reason:

- Pakistani users need practical answers about daily usage, costs, charging access, and intercity trips before an EV purchase feels realistic.

Implications:

- Calculators and estimators are central.
- Charger directory supports the decision journey but is not the whole product.
- Route and charger outputs must be framed as estimates while using demo data.

## 2026-05-24 - Demo Data First

Decision:

- Use static demo data for vehicles, chargers, and route examples in phase 1.

Reason:

- Static data keeps the MVP fast to build and easy to reason about.

Implications:

- Demo data must be clearly marked in code and UI.
- Do not imply live charger availability or complete vehicle coverage.
- Prefer simple data files that can later be replaced by APIs.

Status:

- Still true for the prototype, but first release should replace frontend sample catalog/charger data with backend APIs.

## 2026-05-25 - Simple Calculator Utilities First

Decision:

- Keep phase-1 EV cost, petrol cost, savings, and suitability scoring logic in pure TypeScript utility functions.

Reason:

- The first calculator UI should stay simple and testable, with business logic kept outside React components.

Implications:

- Suitability scoring uses transparent weighted inputs instead of pretending to be a precise recommendation engine.
- Future UI work can reuse the same functions without adding a backend or external APIs.

## 2026-05-25 - Solar Availability Bonus

Decision:

- Solar availability gives a small suitability bonus but does not reduce monthly EV cost in phase 1 because accurate solar savings require solar charging share or effective solar cost.

Reason:

- Solar can improve charging independence, but cost savings depend on installation size, net metering, daytime charging, household load, and the user's solar charging share.

Implications:

- The score can reflect a modest practical benefit from solar availability.
- Monthly EV cost remains based on the entered electricity unit price.
- A later calculator task can add solar-adjusted cost modeling when the product defines those assumptions.

## 2026-05-25 - Static Route Feasibility Estimate

Decision:

- Use static demo routes in either direction for phase-1 route feasibility and calculate range from practical highway range plus current and reserve battery percentages.

Reason:

- Users need a quick confidence estimate before live maps, chargers, traffic, or terrain data are available.

Implications:

- Route feasibility is an estimate, not a guarantee.
- Missing city pairs show a clear unavailable-data message.
- Charging required is based only on whether usable range covers the route distance.

## 2026-05-25 - Route Validation Before Feasibility

Decision:

- Route feasibility requires a different origin and destination city, and reserve battery must be lower than current battery before estimating usable range.

Reason:

- Same-city selections are outside the intercity estimator's purpose, and invalid battery buffers can create misleading negative range outputs.

Implications:

- The destination city list excludes the selected origin city.
- Invalid battery inputs show a correction message instead of a trip verdict.
- Calculator utilities defensively clamp usable battery to prevent negative range values.

## 2026-05-25 - Validation Before Calculator Results

Decision:

- Calculator pages show validation messages before rendering result cards when required numeric inputs are outside allowed ranges.

Reason:

- Broken outputs such as NaN, Infinity, or misleading negative ranges reduce trust in an MVP focused on buyer confidence.

Implications:

- Cost and suitability pages validate shared driving, electricity, and petrol inputs before displaying estimates.
- Route feasibility validates battery percentages before displaying a verdict.
- When EV running cost is higher than petrol, the UI describes it as an extra cost rather than savings.

## 2026-05-25 - Free EV Savings Utility for Bikes and Cars

Decision:

- Reposition EVReady Pakistan from an EV car practicality MVP into a free EV savings and charging-cost utility for Pakistan covering both EV bikes and EV cars.

Reason:

- EV bike and petrol-savings use cases are more mass-market and likely more shareable in Pakistan than EV car-only route planning. Monetization is expected later through ads, sponsored placements, and qualified leads rather than charging normal users.

Implications:

- EV Bike Savings Calculator becomes the next major feature.
- Route feasibility and charger directory remain supporting tools.
- The product should avoid a paid user subscription model for now.
- Future monetization should focus on ads, sponsored placements, and leads for EV dealers, home charger installers, solar installers, and electricians.

## 2026-05-25 - Manual Cost Comparison Inputs

Decision:

- Cost Comparison uses manual bike/car inputs instead of vehicle catalog selection to avoid mixing bikes and cars in one confusing dropdown.

Reason:

- The catalog is currently car-focused, while the quick comparison tool needs to serve both EV bike and EV car users without implying a complete verified vehicle database.

Implications:

- Cost Comparison stays a simple quick-estimate tool.
- EV Bike Savings remains the detailed bike payback tool.
- Vehicle catalog can evolve independently without blocking bike/car comparison.

## 2026-05-26 - Vehicle Catalog Must Support Bikes and Cars Clearly

Decision:

- Vehicle Catalog should clearly support EV bikes and EV cars as separate categories instead of showing a car-only catalog under a bike/car product direction.

Reason:

- EVReady Pakistan is now positioned around bikes and cars, so the catalog must not imply complete bike coverage while only listing cars.

Implications:

- Add EV bike demo entries before presenting the catalog as bike/car useful.
- Keep listings and filters category-aware.
- Add price and range filters before adding higher-complexity catalog features.

## 2026-05-26 - Vehicle Ratings and Reviews Deferred

Decision:

- Vehicle ratings and reviews are deferred until after first deployment.

Reason:

- Useful reviews need persistence, moderation/spam handling, and a backend-backed data flow. Static fake reviews would reduce trust.

Implications:

- Do not add ratings/reviews to the first-release static catalog.
- Plan backend and moderation needs before implementation.
- Later listing cards can show rating count and average rating with max 1 decimal place once real persisted reviews exist.

Status:

- Partially superseded by the 2026-05-29 approved-only vehicle review display decision.

## 2026-05-26 - Charger Data Strategy Before More Charger UI

Decision:

- Charger directory data strategy should be planned before adding more charger UI.

Reason:

- Incomplete or stale charger data can mislead users about charging availability and route confidence.

Implications:

- Keep charger data clearly marked as demo/unverified until a source and update process exists.
- Plan collection, verification, update cadence, and possible user feedback/reporting before expanding charger features.

## 2026-05-26 - Backend-Backed First Release

Decision:

- First release will not be purely frontend-only/dummy-data based. This frontend repo remains React + Vite + TypeScript + Tailwind, and backend implementation will live in a separate repo with its own docs.

Reason:

- Vehicle catalog data, charger directory data, and Get Help lead submissions need persistence and update paths before the product can be treated as release-ready.

Implications:

- Vehicle Catalog should consume backend vehicle APIs.
- Charger Directory should consume backend charger APIs.
- Get Help / lead capture submissions should be stored through backend.
- Calculators can remain frontend-side where users manually enter values.
- Vehicle and charger data may initially be managed through backend DB seed/manual data entry.
- No broad admin UI is required for the first backend release unless planned later.
- Demo-data UI wording should be removed after backend integration and replaced with verify-before-purchase/travel guidance.
- Ratings/reviews remain deferred because they need persistence, moderation, and spam handling.

## 2026-05-26 - Normalize Backend Vehicle Records in the Frontend

Decision:

- Convert backend vehicle API records into the existing frontend `Vehicle` shape at the API boundary
  before storing them in page state.

Reason:

- The backend returns nested `brand` and `chargerType` objects, numeric IDs, and different field
  names for price/range than the original frontend demo data. Normalizing once avoids React rendering
  objects directly and keeps calculators using their current simple vehicle fields.

Implications:

- Pages should call the shared normalization helper when consuming `GET /api/v1/vehicles`.
- Frontend estimates may derive practical city/highway range and efficiency from backend claimed
  range and battery capacity until the backend provides dedicated practical estimate fields.

## 2026-05-27 - Private Repo Git and Deployment Hygiene

Decision:

- Keep useful docs and Markdown files tracked in the private frontend repo, while ignoring local
  env files, dependency folders, Vite build output, coverage, logs, OS files, and IDE files.

Reason:

- Project documentation supports maintainability in a private repo, but generated files and local
  machine configuration should not enter Git or production web roots.

Implications:

- `.env.example` remains trackable for documenting required frontend config.
- `VITE_*` variables may be used for frontend config, but they must not contain secrets because
  Vite bundles them into browser-visible output.
- Production hosting should publish the Vite build output only, not the full repository.

## 2026-05-28 - Source Confidence Labels Are Not Field Verification

Decision:

- Vehicle and charger badges should use source-confidence wording, such as source-backed or
  source not confirmed, instead of wording that could imply EVReady physically audited every
  vehicle or charger.

Reason:

- Backend `verificationStatus` values describe source confidence for catalog and directory data,
  not live charger availability, field inspection, or guaranteed vehicle/dealer accuracy.

Implications:

- OFFICIAL should mean backed by an official, operator, distributor, or similar source.
- Vehicle pages should still ask users to verify specs, price, dealer details, and availability
  before purchase.
- Charger pages should still ask users to verify connector support, pricing, access, and
  availability before travel.

## 2026-05-28 - Static SEO Foundation Before SSR

Decision:

- Start technical SEO with truthful static `index.html` metadata, `robots.txt`, `sitemap.xml`, and
  minimal WebSite JSON-LD served by the existing Vite frontend.

Reason:

- EVReady Pakistan needs basic search and social-preview context, but SSR, prerendering, analytics,
  and heavier SEO infrastructure are premature for this lightweight frontend task.

Implications:

- The sitemap should include only public frontend routes on `https://evready.pk`.
- Metadata must avoid claims of live charger availability, complete official coverage, ratings,
  prices, or guaranteed SEO outcomes.
- Google Search Console and Bing Webmaster Tools setup remain external/manual follow-up steps.

## 2026-05-28 - Minimal Protected Read-Only Admin UI

Decision:

- Add internal routes for session-cookie protected admin sign-in and read-only lead/contact
  visibility.

Reason:

- EVReady Pakistan needs operational visibility into Get Help leads and Contact Us submissions
  without changing the public user experience or adding broad data-management features.

Implications:

- Admin API requests must use `credentials: "include"` because the backend auth session is
  cookie-based.
- Admin credentials must not be stored in browser storage or hardcoded in the frontend.
- Public navigation should not prominently expose admin access.
- Broader admin capabilities remain deferred until access control, auditability, moderation, and
  operational ownership are planned.

## 2026-05-29 - Dedicated Public Detail Pages

Decision:

- Use dedicated routes for public vehicle and charger details instead of future modal-based
  review/comment display.

Reason:

- Detail pages give users stable links for backend-backed catalog and directory records while
  keeping ratings, reviews, comments, and charger feedback deferred until approved backend APIs and
  moderation support exist.

Implications:

- Vehicle cards link to `/vehicles/:id`.
- Charger cards link to `/chargers/:id`.
- Detail pages must keep source-confidence and verify-before-purchase/travel wording visible.
- Do not show fake ratings, fake stars, fake comments, or modal review UI before the backend review
  system is approved and implemented.

## 2026-05-29 - Approved-Only Vehicle Review Display

Decision:

- Show vehicle rating aggregates and public vehicle reviews only from backend approved-review data.

Reason:

- Community reviews can help first-time EV buyers, but pending, rejected, spam, or fake review data
  would damage trust and could imply claims that EVReady has not verified.

Implications:

- Vehicle cards and detail pages may show approved aggregate rating/count fields from backend
  vehicle responses.
- Vehicle detail pages may show approved public reviews from the backend public review endpoint.
- Newly submitted pending reviews must not appear publicly until approved.
- Ratings and reviews must be framed as community-submitted and moderated, not official EVReady
  verification.

## 2026-05-29 - Public Listings Use Load More

Decision:

- Public vehicle and charger listing pages use mobile-friendly load-more browsing instead of
  classic page controls when the frontend has the filtered list available.

Reason:

- The catalog and directory are browsing aids, and showing a small first batch with explicit load
  more keeps mobile pages shorter while preserving the user's filter context when moving into
  detail pages and back.

Implications:

- Vehicle Catalog and Charger Directory should show six records initially and reveal more in small
  batches.
- Listing filter state should be represented in URL query parameters rather than browser storage.
- Detail pages remain the preferred place for deeper information and review access.

## 2026-06-07 - Route-Specific Public Canonicals

Decision:

- Keep the static homepage canonical as the HTML fallback, then update `canonical` and `og:url`
  from the React route pathname after the app mounts.

Reason:

- EVReady Pakistan is a Vite SPA, so public routes share the same `index.html`; without a
  route-aware head update, rendered pages like `/chargers` declare the homepage as canonical.

Implications:

- Public routes should canonicalize to `https://evready.pk/` for the homepage and
  `https://evready.pk/{path}` for route pages, excluding query strings and hash fragments.
- Route-specific titles/descriptions remain a separate future SEO improvement.

## 2026-06-18 - AI Recommender Health Check Before Page Use

Decision:

- The AI EV Recommendation page checks the separate EVReady AI Recommender Service health endpoint before showing the recommendation form.
- The frontend uses the recommender service Actuator health endpoint for local integration readiness checks.
- If the recommender service is unavailable, the page shows a friendly page-level fallback instead of a broken form.
- The page keeps checking periodically and recovers automatically when the recommender service becomes available again.

Reason:

- The AI recommender is a separate microservice from the main EVReady backend and can be unavailable while the rest of the public EVReady frontend still works.
- Checking health before form use makes the microservice boundary visible, safer, and easier to explain in portfolio discussions.
- A page-level fallback avoids confusing users with failed recommendation requests when the recommender service is offline.

Implications:

- The recommender service must expose only the required health endpoint for this frontend check.
- Actuator exposure should stay limited to `health`.
- Actuator CORS must explicitly allow the local frontend origin for development.
- Frontend health checks are a UX/readiness feature, not production security.
- Production recommender access should still route through the existing backend or a controlled gateway before public deployment.
- This health check proves the recommender service is reachable and reporting `UP`; it does not prove model generation quality or Ollama response quality.
# MVP Review Checklist

Use this checklist to manually review EVReady Pakistan before the first backend-backed public
release.

## 1. Product Positioning Review

- [ ] Does the app clearly communicate EV savings for bikes and cars?
- [ ] Does the app clearly communicate that it is Pakistan-focused?
- [ ] Does it avoid looking like only a charger map or route planner?
- [ ] Is any remaining sample/unverified data clearly explained?
- [ ] Does it feel like a free utility rather than a paid SaaS product?

## 2. User Journey Review

- [ ] Can a first-time user understand where to start?
- [ ] Can the user move from suitability calculator to cost comparison to route feasibility?
- [ ] Are page labels clear?
- [ ] Does the journey make EV Bike Savings Calculator, Home Charging Cost Estimator, and Solar EV Charging Estimator easy to find?

## 3. Calculator Review

- [ ] Suitability Calculator default values work.
- [ ] Invalid values show validation messages.
- [ ] Solar yes/no behavior is understandable.
- [ ] No NaN, Infinity, or fake score appears for invalid inputs.

## 4. Cost Comparison Review

- [ ] Default values work.
- [ ] Invalid petrol average is handled.
- [ ] Negative savings are shown as extra cost.
- [ ] Monthly and yearly values are understandable.
- [ ] The result language works for both EV bike and EV car savings direction.

## 5. Route Feasibility Review

- [ ] Valid route works.
- [ ] Unsupported valid city pair works.
- [ ] Same-city pair is prevented.
- [ ] Reserve battery higher than current battery is handled.
- [ ] No negative usable range is displayed.

## 6. Vehicle Catalog Review

- [ ] Vehicle Catalog loads data from backend API after integration.
- [ ] Filters work.
- [ ] Bike/Car category filtering is clear.
- [ ] Bike listings and car listings do not feel mixed together.
- [ ] Price filter works.
- [ ] Range filter works.
- [ ] Empty states work.
- [ ] Demo-data wording is removed after backend integration.
- [ ] Users are still told to verify specs and price before purchase.
- [ ] Ratings/reviews are not shown as fake static data; they are intentionally deferred from first release.

## 7. Charger Directory Review

- [ ] Charger Directory loads data from backend API after integration.
- [ ] Filters work.
- [ ] Empty states work.
- [ ] Demo-data wording is removed after backend integration.
- [ ] Users are still told to verify charger details before travel.
- [ ] Charger data is not presented as live or verified.
- [ ] Charger data has a source/verification strategy before it is treated as reliable.

## 8. Get Help / Lead Capture Review

- [ ] Get Help submissions are sent to the backend.
- [ ] Submission errors are handled clearly.
- [ ] No authentication is required for first release.
- [ ] No payment or booking flow is added.

## 9. Mobile Layout Review

- [ ] Home page looks usable on mobile width.
- [ ] Forms are readable on mobile width.
- [ ] Result cards do not overflow.

## 10. Next Phase Decision

Review whether the next phase supports the free EV savings utility direction:

- [ ] Integrate backend APIs for Vehicle Catalog.
- [ ] Integrate backend APIs for Charger Directory.
- [ ] Store Get Help / lead capture submissions through backend.
- [ ] Keep calculators frontend-side where users manually enter values.
- [ ] Keep backend implementation and docs in a separate repo.
- [ ] No admin UI is required for first backend release unless planned later.
- [ ] Keep ratings/reviews deferred until persistence and moderation are planned.
- [ ] Extend copy/share result summaries beyond the EV Bike Savings Calculator when useful.
- [ ] Support future ads and leads without making users pay.
- [ ] Keep maps, accounts, payments, bookings, and subscriptions out of the next step.

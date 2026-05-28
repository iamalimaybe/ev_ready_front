# MVP Review Checklist

Use this checklist to manually review EVReady Pakistan after the first backend-backed public
deployment.

## 1. Product Positioning Review

- [x] Does the app clearly communicate EV savings for bikes and cars?
- [x] Does the app clearly communicate that it is Pakistan-focused?
- [x] Does it avoid looking like only a charger map or route planner?
- [x] Is incomplete/source-confidence data clearly explained?
- [x] Does it feel like a free utility rather than a paid SaaS product?

## 2. User Journey Review

- [x] Can a first-time user understand where to start?
- [x] Can the user move from suitability calculator to cost comparison to route feasibility?
- [x] Are page labels clear?
- [x] Does the journey make EV Bike Savings Calculator, Home Charging Cost Estimator, and Solar EV Charging Estimator easy to find?

## 3. Calculator Review

- [x] Suitability Calculator default values work.
- [x] Invalid values show validation messages.
- [x] Solar yes/no behavior is understandable.
- [x] No NaN, Infinity, or fake score appears for invalid inputs.
- [x] Suitability Calculator result can be copied as a plain-text estimate summary.

## 4. Cost Comparison Review

- [x] Default values work.
- [x] Invalid petrol average is handled.
- [x] Negative savings are shown as extra cost.
- [x] Monthly and yearly values are understandable.
- [x] The result language works for both EV bike and EV car savings direction.
- [x] Cost Comparison result can be copied as a plain-text estimate summary.

## 5. Route Feasibility Review

- [x] Valid route works.
- [x] Unsupported valid city pair works.
- [x] Same-city pair is prevented.
- [x] Reserve battery higher than current battery is handled.
- [x] No negative usable range is displayed.
- [x] Route Feasibility result can be copied as a plain-text estimate summary.

## 6. Vehicle Catalog Review

- [x] Vehicle Catalog loads data from backend API in production.
- [x] Filters work.
- [x] Bike/Car category filtering is clear.
- [x] Bike listings and car listings do not feel mixed together.
- [x] Price filter works.
- [x] Range filter works.
- [x] Empty states work.
- [x] Demo-data wording is removed after backend integration.
- [x] Users are still told to verify specs and price before purchase.
- [x] Ratings/reviews are not shown as fake static data; they are intentionally deferred.

## 7. Charger Directory Review

- [x] Charger Directory loads data from backend API in production.
- [x] Charger Directory loads city and charger type options from backend APIs.
- [x] Filters work.
- [x] Empty states work.
- [x] Demo-data wording is removed after backend integration.
- [x] Users are still told to verify charger details before travel.
- [x] Charger data is not presented as live or EVReady field-verified.
- [ ] Charger data has a source/verification strategy before it is treated as reliable.

## 8. Get Help / Lead Capture Review

- [x] Get Help submissions are sent to the backend.
- [x] Contact Us submissions are sent to the backend.
- [x] Submission errors are handled clearly.
- [x] No authentication is required for public user flows.
- [x] No payment or booking flow is added.

## 9. Mobile Layout Review

- [x] Home page looks usable on mobile width.
- [x] Forms are readable on mobile width.
- [x] Result cards do not overflow.

## 10. Next Phase Decision

Review whether the next phase supports the free EV savings utility direction:

- [x] Integrate backend APIs for Vehicle Catalog.
- [x] Integrate backend APIs for Charger Directory.
- [x] Store Get Help / lead capture submissions through backend.
- [x] Store Contact Us submissions through backend.
- [x] Keep calculators frontend-side where users manually enter values.
- [x] Keep backend implementation and docs in a separate repo.
- [x] Do not add admin UI until auth and access-control planning is done.
- [ ] Keep ratings/reviews deferred until persistence and moderation are planned.
- [x] Extend copy/share result summaries beyond the EV Bike Savings Calculator when useful.
- [ ] Support future ads and leads without making users pay.
- [x] Keep maps, accounts, payments, bookings, and subscriptions out of public first-release flows.

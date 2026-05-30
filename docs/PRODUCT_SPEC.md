# Product Spec

## Product Name

EVReady Pakistan

## Summary

EVReady Pakistan is a free Pakistan-focused EV savings and charging-cost utility for bikes and cars.

The product helps people estimate whether switching from petrol to an EV bike or EV car will actually save money and make practical ownership sense.

## Product Direction

EVReady Pakistan should be a lightweight public utility, not a heavy SaaS product. The primary experience should be calculators, practical decision support, shareable results, and simple guides.

The product should cover both EV bikes and EV cars. EV bike savings, home charging cost, solar EV
charging, and quick bike/car cost comparison are implemented in the frontend using user-entered
assumptions. Vehicle Catalog, Charger Directory, Get Help, and Contact Us are backend-backed in the
deployed production app.

## Target Audience

- Petrol bike owners considering an EV bike.
- Petrol car owners comparing monthly running costs.
- First-time EV buyers in Pakistan.
- Urban commuters estimating home charging cost.
- Users with solar who want a simple EV charging estimate.
- Families who occasionally need route feasibility checks.
- EV-curious users who need practical guidance before contacting a dealer, installer, or electrician.

## Core Value Proposition

EVReady Pakistan gives users a quick, free way to estimate EV savings, charging cost, solar charging impact, and ownership fit before they make a purchase decision.

## Core User Questions

- How much can I save by switching from petrol to an EV bike?
- How much can I save by switching from a petrol car to an EV car?
- What will home charging cost per month?
- Can solar reduce my effective EV charging cost?
- Is an EV practical for my daily commute and charging access?
- Can an EV handle my occasional intercity routes?
- Which EVs, chargers, installers, or dealers should I compare later?

## Implemented Primary Tools

### 1. EV Bike Savings Calculator

Compares petrol bike running cost with EV bike charging cost using Pakistan-focused assumptions.

Inputs:

- Daily kilometers
- Days per month
- Petrol price
- Petrol bike average km per litre
- EV bike efficiency or battery/range estimate
- Electricity unit price
- EV bike purchase price
- Current petrol bike resale value

Outputs:

- Monthly petrol cost
- Monthly EV charging cost
- Monthly savings or extra cost
- Yearly savings estimate
- Full-charge estimates
- Net upgrade cost
- Simple payback context

### 2. EV vs Petrol Monthly Cost Comparison

Compares estimated monthly cost between an EV and a petrol vehicle using manual Bike/Car inputs. It no longer depends on the vehicle catalog selector.

### 3. Home Charging Cost Estimator

Estimates the cost and time for a single home charge using battery size, current battery level, target battery level, electricity unit price, charger power, and charging loss.

### 4. Solar EV Charging Estimator

Estimates monthly EV charging cost when part of charging comes from solar, using solar share, grid unit price, and effective solar unit cost.

### 5. Practical Ownership Fit

Combines daily range, home charging access, city support, savings, solar availability, and intercity usage into plain-language guidance.

## Planned Primary Tools

### Expanded Admin and Data-Management Planning

The frontend now has a minimal protected read-only Admin UI for lead and contact visibility. The
next backend-facing direction is planning how vehicle, charger, lead, and contact data should be
managed safely beyond that read-only view.

Scope:

- Plan expanded admin/data-management responsibilities in the backend repo and docs.
- Keep public frontend calculators frontend-side where users manually enter assumptions.
- Do not expand the Admin UI into payments, bookings, dealer-management, ratings, reviews, or
  public user accounts as part of this planning step.
- Keep ratings/reviews deferred until persistence, moderation, and spam handling are planned.

### Charger Data Strategy and Feedback Planning

Plan how charger data will be collected, source-checked, updated, and shown without misleading
users. User feedback/reporting can be considered later, but should not be implemented until the data
strategy is clear.

Scope:

- Define charger source-confidence meaning and update cadence.
- Avoid implying live charger availability or guaranteed access.
- Keep verify-before-travel guidance visible.
- Consider feedback/reporting later, after ownership and moderation needs are clear.

### Vehicle Ratings and Reviews System

Vehicle detail pages can accept public vehicle review submissions through the backend. Submitted
reviews are stored as pending and are not published immediately.

The protected admin dashboard can moderate submitted vehicle reviews for later public display.
Approval does not mean EVReady has verified the user's claim.

The protected admin dashboard can also moderate submitted charger feedback. Charger feedback
moderation must not update public charger status or imply live charger availability.

Approved-only vehicle rating aggregates are shown on vehicle cards and vehicle detail pages when
approved ratings exist. Vehicle detail pages also show approved public reviews returned by the
backend. Pending, rejected, and spam reviews must not be shown publicly.

Ratings and reviews are community-submitted and moderated before display. They are not official
ratings, and they do not mean EVReady has verified every claim. Static fake reviews, fake ratings,
and fake comments must not be shown.

## Supporting Tools

### Route Feasibility Estimator

Estimates whether a vehicle can complete a route with available range and reserve battery.

First-release behavior:

- Use conservative route examples until backend-backed charger/route data strategy is reliable.
- Do not imply route or charger reliability without verified data.
- Do not use an external map API.
- Show feasibility as an estimate, not a guarantee.

### Vehicle Catalog

Shows a simple catalog of EV bikes and EV cars relevant to Pakistani buyers.

The catalog should include both EV bikes and EV cars from backend data as it becomes available. It should clearly separate bikes and cars so users do not mistake incomplete coverage for a complete market database.

Vehicle API responses include `verificationStatus`, and catalog cards should show small source-confidence badges while still asking users to verify specs and price before purchase.

Dedicated vehicle detail pages at `/vehicles/:id` are the chosen direction for deeper vehicle information. Modal-based review/comment display is deferred and should not be added before backend approved-review APIs exist.

Vehicle cards and detail pages may show approved-only rating aggregates from the backend. Unrated
vehicles should use conservative wording such as be the first to review instead of fake ratings.
Catalog browsing uses a simple load-more pattern so filters remain lightweight on mobile.

### Charger Directory

Shows backend-backed public charger information in production. This supports charging confidence
but must not become the product's main identity.

First release must not claim live charger status unless the backend has a reliable live source and update process.

Charger API responses are expected to include `verificationStatus`, separate from operational `status`, and directory cards should show small source-confidence badges while still asking users to verify charger details before travel.

Dedicated charger detail pages at `/chargers/:id` are the chosen direction for deeper charger information. Charger status must continue to be framed as reported data, not live availability, and modal-based feedback/review display remains deferred.

Charger detail pages can accept public charger feedback submissions through the backend. Submitted
feedback is stored as pending and is not shown publicly unless approved through moderation.
Approved public feedback may be shown on charger detail pages, but it must remain separate from
public charger status and must not imply live availability, access, compatibility, occupancy, or
pricing.

Directory browsing uses a simple load-more pattern. Charger rating aggregates, charger-directory
feedback summaries, and live availability remain deferred.

### Guides and Content

Concise static guides are implemented for practical EV ownership topics such as EV bike savings, home charging cost, and solar EV charging.

## Existing MVP Tool Notes

### EV Suitability Calculator

Collects simple user inputs and produces a practical readiness score.

Inputs include:

- City
- Daily commute distance
- Home charging access
- Solar availability
- Occasional long-trip needs
- Petrol and electricity price assumptions

Outputs include:

- Suitability score
- Plain-language verdict
- Monthly EV cost
- Monthly petrol cost
- Estimated savings or extra cost
- Warnings where assumptions are uncertain

## Monetization Strategy

- Keep the utility free for users.
- Add ads later if they do not damage trust or usability.
- Add sponsored placements later for relevant EV bikes, EV cars, chargers, solar, and installer services.
- Add qualified lead generation later for EV bike dealers, EV car dealers, home charger installers, solar installers, and electricians.
- Do not add a paid user subscription model for now.

## What This Product Is NOT

- Not a heavy SaaS platform.
- Not only an EV car route planner.
- Not only a charger map.
- Not only for existing EV car owners.
- Not a paid subscription product for normal users.
- Not a live charger availability system unless reliable live data is added later.
- Not a booking, payments, or dealer-management platform yet.
- Not an all-in-one backend/admin platform in this frontend repo.

## Frontend/Backend Data Approach

The deployed production frontend consumes backend APIs for vehicles, chargers, charger city/type
options, Get Help submissions, and Contact Us submissions.

Requirements:

- Keep calculator logic frontend-side where users manually enter values, unless a future task needs shared server-side assumptions.
- Continue consuming backend APIs for Vehicle Catalog and Charger Directory.
- Continue storing Get Help / lead capture submissions and Contact Us submissions through backend.
- Keep backend implementation and backend docs in a separate repo.
- Backend vehicle and charger records may initially be managed through DB seed/manual data entry.
- Display frontend source-confidence badges from `verificationStatus` on vehicle and charger cards, treating missing values as `UNVERIFIED`.
- Keep clear "verify before purchase/travel" guidance.
- Keep assumptions visible.
- Avoid implying data is complete, live, or verified.
- Prefer simple data structures that are easy to replace later.
- Do not add static fake user ratings or reviews. Reviews need persistence and moderation.
- Do not treat charger data as reliable until a source and verification process is planned.

## UX Principles

- Keep the first screen action-oriented.
- Prioritize savings calculators and decision support over browsing.
- Use plain language for estimates and warnings.
- Make inputs short and forgiving.
- Design for mobile first, since many users will access the product on phones.
- Avoid map-heavy interactions until live map data is justified.
- Make results easy to copy or share later.
- Keep monetization surfaces clearly secondary to user utility.

## Success Criteria

The MVP is successful if a user can:

- Estimate EV bike savings compared with petrol.
- Estimate EV car savings compared with petrol.
- Understand home charging cost.
- Understand basic solar charging assumptions.
- Enter their usage pattern and understand practical ownership fit.
- Check whether common routes look feasible.
- Browse a backend-backed vehicle catalog.
- See charger coverage without mistaking it for live data.
- Understand that ratings/reviews are not part of first-release scope.

## Current Production State and Next Direction

The frontend and backend are deployed to production and in sync:

- Frontend: `https://evready.pk`
- Backend API: `https://api.evready.pk`
- Vehicle Catalog loads backend vehicle data.
- Charger Directory loads backend charger data and charger city/type options.
- Get Help submits to backend.
- Contact Us submits to backend.
- Internal Admin routes provide protected read-only visibility into Get Help leads and Contact Us
  submissions.
- Trust wording, technical SEO, Cloudflare Web Analytics, and copy/share summaries for
  calculators/estimators are complete.

The next direction is cautious planning for expanded admin/data-management and charger data
strategy. Broader admin capabilities remain deferred until access control, auditability,
moderation, and operational ownership are planned.

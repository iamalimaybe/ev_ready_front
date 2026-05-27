# Product Spec

## Product Name

EVReady Pakistan

## Summary

EVReady Pakistan is a free Pakistan-focused EV savings and charging-cost utility for bikes and cars.

The product helps people estimate whether switching from petrol to an EV bike or EV car will actually save money and make practical ownership sense.

## Product Direction

EVReady Pakistan should be a lightweight public utility, not a heavy SaaS product. The primary experience should be calculators, practical decision support, shareable results, and simple guides.

The product should cover both EV bikes and EV cars. EV bike savings, home charging cost, solar EV charging, and quick bike/car cost comparison are already implemented in the frontend using user-entered assumptions. Vehicle, charger, and lead data should come from a separate backend repo for the first backend-backed release.

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

### Vehicle Catalog Bike/Car Segregation and Advanced Filters

The next catalog task should make the Vehicle Catalog clearly support both EV bikes and EV cars.

Scope:

- Add EV bike entries to demo vehicle data as sample data.
- Let users filter/select Bike or Car clearly.
- Keep listings category-aware so bike and car assumptions are not mixed.
- Add price filtering.
- Add range filtering.
- Keep the existing mobile layout usable.
- Do not add ratings/reviews in this task.

### Backend API Integration for Frontend

Integrate this frontend with backend APIs from a separate backend repo.

Scope:

- Vehicle Catalog consumes vehicle data from backend.
- Charger Directory consumes charger data from backend.
- Get Help / lead capture submissions are stored through backend.
- Vehicle API records include `verificationStatus`, and charger API records are expected to include it, so the frontend can show source-confidence labels without implying EVReady personally audited the data.
- Calculators can remain frontend-side where users enter values manually.
- Demo-data UI wording should be removed after backend integration and replaced with "verify before purchase/travel" style guidance.

Backend notes:

- Backend implementation lives in its own repo and docs.
- No admin UI is required for the first backend release unless planned later.
- Vehicle and charger data may initially be managed through backend DB seed/manual data entry.

### Vehicle Ratings and Reviews System

Ratings and reviews are a future post-first-release feature. Users may later rate vehicles from 1 to 5 stars and add text reviews. Listing cards should later show rating count and average rating with max 1 decimal place, and a vehicle detail view or modal should show individual reviews.

This feature requires backend persistence, moderation/spam handling, and a backend-backed data flow. It should not be built as static fake data for the first release.

### Charger Data Strategy and Feedback Planning

Plan how charger data will be collected, verified, updated, and shown without misleading users. User feedback/reporting can be considered later, but should not be implemented until the data strategy is clear.

## Supporting Tools

### Route Feasibility Estimator

Estimates whether a vehicle can complete a route with available range and reserve battery.

First-release behavior:

- Use conservative route examples until backend-backed charger/route data is reliable.
- Do not imply route or charger reliability without verified data.
- Do not use an external map API.
- Show feasibility as an estimate, not a guarantee.

### Vehicle Catalog

Shows a simple catalog of EV bikes and EV cars relevant to Pakistani buyers.

The catalog should include both EV bikes and EV cars from backend data as it becomes available. It should clearly separate bikes and cars so users do not mistake incomplete coverage for a complete market database.

Vehicle API responses include `verificationStatus`, and catalog cards should show small source-confidence badges while still asking users to verify specs and price before purchase.

### Charger Directory

Shows backend-backed public charger information when available. This supports charging confidence but must not become the product's main identity.

First release must not claim live charger status unless the backend has a reliable live source and update process.

Charger API responses are expected to include `verificationStatus`, separate from operational `status`, and directory cards should show small source-confidence badges while still asking users to verify charger details before travel.

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

The frontend currently uses local sample data while backend work is planned separately. The first backend-backed release should consume backend APIs for vehicles, chargers, and Get Help lead submissions.

Requirements:

- Keep calculator logic frontend-side where users manually enter values, unless a future task needs shared server-side assumptions.
- Consume backend APIs for Vehicle Catalog and Charger Directory once available.
- Store Get Help / lead capture submissions through backend once available.
- Keep backend implementation and backend docs in a separate repo.
- Backend vehicle and charger records may initially be managed through DB seed/manual data entry.
- Display frontend source-confidence badges from `verificationStatus` on vehicle and charger cards, treating missing values as `UNVERIFIED`.
- Remove demo-data UI wording after backend integration and replace it with clear "verify before purchase/travel" guidance.
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
- Browse a backend-backed vehicle catalog once API integration is complete.
- See charger coverage without mistaking it for live data.
- Understand that ratings/reviews are not part of first-release scope.

## Next Product Milestone: Backend API Integration

The next milestone is to integrate this frontend with backend APIs from the separate backend repo for Vehicle Catalog, Charger Directory, and Get Help lead submission.

Immediate next task:

- Integrate backend APIs for Vehicle Catalog, Charger Directory, and Get Help lead submission

# AGENTS.md

## Project

EVReady Pakistan is a lightweight web/PWA MVP that helps users in Pakistan decide whether an EV is practical for their daily usage, monthly cost savings, charging access, and occasional intercity travel.

This product is not just a charger map. The core value is EV buying and usage confidence for Pakistan.

## Build Strategy

- This repo is the React, Vite, TypeScript, and Tailwind CSS frontend.
- First release should integrate with the separate backend repo for Vehicle Catalog data, Charger
  Directory data, and Get Help lead submissions.
- Keep calculators frontend-side where users manually enter values.
- Use clearly labeled demo data only as a temporary frontend fallback until backend APIs are wired.
- Do not add authentication.
- Do not add payments.
- Do not add charger booking.
- Do not add external map APIs.
- Do not add OEM vehicle integrations.
- Avoid over-engineering.

## Working Rules for Codex

- Make small, focused changes only.
- Read only files needed for the task.
- Do not inspect unrelated pages or files.
- Do not run build or tests unless explicitly asked.
- Do not redesign unless explicitly asked.
- Do not update unrelated docs.
- Preserve the existing project structure unless a task clearly requires a new folder or file.
- Avoid adding libraries unless they are necessary for the task.
- Keep components simple, readable, and easy to replace.
- Keep business logic in utility functions instead of burying it inside UI components.
- Mark sample data clearly as demo data.
- Update `docs/CODEX_TASKS.md` after completing a task.
- Mention changed files after every task.
- Prefer docs and task planning before large implementation changes.
- Prefer clear names over clever abstractions.
- Avoid broad refactors unless the user explicitly asks for one.
- Keep phase-1 UX useful without pretending the demo data is live or complete.

## Implementation Preferences

- Put reusable UI in `src/components`.
- Put page-level screens in `src/pages` if routing is introduced.
- Put calculators, estimators, and formatting helpers in `src/lib` or `src/utils`.
- Put static demo data in `src/data` and label it clearly.
- Keep TypeScript types close to the feature at first; promote shared types only when reuse is obvious.
- Write calculations as pure functions where possible.
- Use Tailwind utility classes directly until repetition creates a real maintenance issue.

## Product Guardrails

- Design for Pakistani usage patterns, prices, road conditions, and charging uncertainty.
- Be transparent when an output is an estimate.
- Favor practical confidence-building over precision theater.
- Make assumptions visible to users.
- Keep the MVP understandable to first-time EV buyers.
- Do not imply charger availability, pricing, or route feasibility is live unless real integrations are added later.

## Documentation Habit

After each meaningful task:

1. Update `docs/CODEX_TASKS.md` with what changed and what remains.
2. Add any product or technical decisions to `docs/DECISIONS.md`.
3. Mention changed files in the final response.

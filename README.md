# No Walls Pricing Builder

A private, review-only recommendation concept for No Walls' September 2026 pricing.

## Current review phase

- Package names, square-footage tiers, photo counts, Creator tiers, and package add-ons mirror Brian's September v2 pricing supplied on September 21, 2026.
- The simplified video presentation shows Classic, Luxe, and Influencer levels with horizontal or vertical formats. À-la-carte video prices remain visibly pending until Brian confirms them.
- The UI is intentionally review-only. It does not collect customer details, create Aryeo sessions, or change the restored production order form.
- The Vercel endpoint also rejects session creation while `PRICING_REVIEW_ONLY` is enabled in `shared/aryeoCatalog.ts`.
- The project retains the tested Aryeo session implementation for a later, explicitly approved connection phase.
- The configured order-form ID belongs to the private prototype form, never Brian's restored production form.

When connection work resumes, Aryeo's order-form-session API can prefill customer and property data but cannot preselect a product. The customer must still choose the matching package, schedule, accept the terms, and confirm in Aryeo. Do not replace this with a direct Orders API write until the complete scheduling and terms flow has been proven against the private prototype form.

## Local development

```bash
npm install
npm run dev
```

The Vite development server serves the review UI. Use `vercel dev` only when testing the API boundary locally.

## Server configuration

Copy `.env.example` to `.env.local` and provide:

- `ARYEO_API_KEY`: a server-only Aryeo API key.
- `ARYEO_BOOKING_ENABLED=true`: explicitly enables session creation after review mode is removed.
- `ARYEO_ORDER_FORM_ID`: defaults to the private prototype form.
- `ARYEO_SUCCESS_URL`: optional HTTPS return page after a completed Aryeo order.

Never use a `VITE_` prefix for the API key; Vite exposes those variables to the browser bundle. Review mode takes precedence over the environment and returns `PRICING_REVIEW_ONLY` without calling Aryeo.

## Verification

```bash
npm run typecheck
npm test
npm run build
```

The tests verify the September price matrix, recommendation behavior, review-only endpoint, supported Aryeo payload, trusted redirect URLs, and the browser/server credential boundary.

## Deployment

This project includes a Vercel Function in `api/booking-session.ts` and a `vercel.json` that builds the Vite output to `dist`. Keep review mode enabled until the visual pricing concept is approved and the private Aryeo form has been aligned.

The generated `docs/` directory remains a static build for GitHub Pages. Static hosting cannot execute the server function, so that version uses the direct Aryeo fallback rather than carrying customer details into a session.

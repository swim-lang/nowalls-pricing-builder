# No Walls Pricing Builder

A custom recommendation experience backed by the production No Walls Aryeo order form.

## What is connected

- Package names, prices, photo counts, and variant choices mirror the production `NW Order Now` catalog reviewed on September 2, 2026.
- The browser posts customer, structured address, and package-choice data to `/api/booking-session`.
- The Vercel Function keeps the Aryeo API key server-side and creates an Aryeo order-form session.
- The customer finishes product selection, add-ons, scheduling, terms acceptance, and confirmation in Aryeo.
- If the function is disabled or unavailable, the UI still provides a direct link to the live No Walls order form.

Aryeo's order-form-session API does not accept a preselected product. The result screen therefore tells the customer exactly which package and variant to select after the handoff. Do not replace this with a direct Orders API write until the complete scheduling and terms flow has been proven in a non-production workspace.

## Local development

```bash
npm install
npm run dev
```

The Vite development server serves the UI only. Use `vercel dev` when testing the `/api/booking-session` function locally.

## Server configuration

Copy `.env.example` to `.env.local` and provide:

- `ARYEO_API_KEY`: a server-only Aryeo API key.
- `ARYEO_BOOKING_ENABLED=true`: explicitly enables session creation.
- `ARYEO_ORDER_FORM_ID`: defaults to the audited production `NW Order Now` form.
- `ARYEO_SUCCESS_URL`: optional HTTPS return page after a completed Aryeo order.

Never use a `VITE_` prefix for the API key; Vite exposes those variables to the browser bundle. With `ARYEO_BOOKING_ENABLED=false`, submissions produce a safe direct-form handoff and do not call Aryeo's API.

## Verification

```bash
npm run typecheck
npm test
npm run build
```

The integration tests verify request validation, the supported Aryeo payload, the API call boundary, trusted redirect URLs, current catalog values, and that server credential identifiers and the private API target do not appear in the browser bundle.

## Deployment

This project includes a Vercel Function in `api/booking-session.ts` and a `vercel.json` that builds the Vite output to `dist`. Configure the server variables in the deployment environment before enabling live session creation.

The generated `docs/` directory remains a static build for GitHub Pages. Static hosting cannot execute the server function, so that version uses the direct Aryeo fallback rather than carrying customer details into a session.

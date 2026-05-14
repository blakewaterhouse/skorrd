# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Skorrd is a last-minute appointment booking platform for Australia. Three apps:
- **index.html** — Customer app (browse slots, book, pay)
- **skorrd-business.html** — Business dashboard (post slots, view earnings)
- **skorrd-admin.html** — Internal admin

No build toolchain. No framework. All apps are single-file HTML with embedded `<style>` and `<script>` blocks.

## Deployment

Push to `main` → Netlify auto-deploys. No build step.

Supabase Edge Functions (TypeScript/Deno) are deployed separately:
```bash
supabase functions deploy <function-name>
```

## Architecture

### Frontend
Vanilla JS, no bundler. All state lives in a single in-memory `state` object per app. Navigation is a single-page pattern via a `go(screen, opts)` function that shows/hides panels by toggling CSS classes.

Key patterns in `index.html`:
- `go(screen, opts)` — navigate between screens (`browse`, `slot`, `login`, `account`, etc.)
- `loadSlots()` / `loadBookings()` — fetch from Supabase, update `state`, re-render
- `renderCards()` / `renderMap()` — re-render the slot list or Leaflet map
- `handlePay()` — Stripe payment flow → calls `confirm-booking` Edge Function

Responsive breakpoint is **700px**. Mobile uses bottom nav; desktop uses sidebar.

### Backend (Supabase)
- Auth, database (PostgreSQL), and realtime — all via Supabase JS client embedded in each HTML file
- Row Level Security enforces data access; no server-side auth middleware
- Edge Functions handle side effects: payments (`confirm-booking`), cancellations (`cancel-booking`), email (`resend`), and web push notifications (`notify-slot-posted`, `save-push-subscription`)

### PWA
Service worker (`sw.js`) uses network-first for HTML, cache-first for assets. Push notifications use VAPID protocol; only available in standalone (installed) mode on iOS.

### Email
Resend API via Edge Functions, sent from `hello@skorrd.com.au`.

### Payments
Stripe v3 (test keys currently active). Payment intent created in `confirm-booking` Edge Function.

## Credentials (public/anon — safe to commit)
Supabase URL, anon key, VAPID public key, and Stripe publishable key are hardcoded in each HTML file. Sensitive keys (Stripe secret, VAPID private, Resend) live in `supabase/functions/.env` (not in git).

## Layout Debugging
After 2 failed CSS iteration attempts on a layout bug, switch to proposing structural HTML changes instead of continuing to adjust CSS properties.

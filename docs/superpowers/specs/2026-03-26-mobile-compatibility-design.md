# Mobile Compatibility — Design Spec
**Date:** 2026-03-26
**Files:** `index.html`, `skorrd-business.html`
**Stack:** Plain HTML/CSS/JS, no framework

---

## Overview

Make both the customer app and business dashboard fully functional on mobile (iOS Safari, 375px–430px viewport). Both files are single-file apps with all CSS inline in `<style>` blocks.

---

## index.html — Customer App

### 1. Bottom Nav Visibility

**Problem:** Bottom tab bar (Browse / How it works / For business) is not showing on mobile. The HTML `<div class="bottom-nav">` is present at end of `<body>` and CSS `display:flex` is set as base style with `@media(min-width:701px){display:none}` for desktop. Most likely cause: staging not redeployed since last commits, OR stale SW cache serving old HTML.

**Fix:**
- Add `display:flex !important` to the base `.bottom-nav` rule on mobile breakpoint to guarantee cascade safety
- Redeploy staging after all fixes in this pass
- Verify `padding-bottom:env(safe-area-inset-bottom)` works on iPhone

### 2. Banner Gap

**Problem:** A strip of content is visible between the fixed nav and the sticky coral `.launch-banner`. Caused by mismatch between actual mobile nav height and the `top` sticky offset values.

**Fix:**
- Set consistent mobile nav height via `min-height` or by matching `padding-top` on `.screen` exactly to nav height
- Ensure `.launch-banner{top: [nav-height]px}` and `.filters-bar{top: [nav-height + banner-height]px}` are accurate
- Nav background is already opaque (`rgba(255,251,245,.94)`) so no bleed — the gap itself is the issue

### 3. Filter Bar (3-row wrapping)

**Problem:** On mobile the filter bar wraps into 3 rows: (1) slot count + time chips, (2) sort select, (3) search + view toggle. Takes excessive vertical space.

**Fix:**
- Split into two distinct zones:
  - **Top row:** slot count (left) + view toggle (right) — `display:flex; justify-content:space-between`
  - **Chips row:** single horizontally-scrollable row — `display:flex; flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none`
  - Chips row contains: All times · Today · Tomorrow · Date · Sort · Search (all `white-space:nowrap; flex-shrink:0`)
- Remove `flex-wrap:wrap` from `.filters-bar` on mobile
- Keep sticky behaviour and existing `top` offset

---

## skorrd-business.html — Business Dashboard

### 4. Mobile Bottom Tab Bar

**Problem:** Sidebar collapses to 52px icon-only strip on mobile — no labels, wastes horizontal space.

**Fix:**
- At `max-width:700px`: hide sidebar entirely (`display:none`)
- Add `<div class="dash-bottom-nav">` before `</body>` with 5 tabs:
  - 📊 Overview
  - 📅 Slots
  - ➕ Add (coral filled circle button, centre tab)
  - 💰 Earnings
  - 🔔 Notifications (with badge support)
- Profile accessible via a settings icon (⚙️) in the Overview panel header on mobile
- `.dash-main` takes full width (`width:100%`) when sidebar is hidden
- Add `padding-bottom:80px` to `.dash-panel` on mobile to clear the tab bar
- Tab bar: `position:fixed; bottom:0; left:0; right:0; z-index:500; padding-bottom:env(safe-area-inset-bottom)`

### 5. Dashboard Panel Padding

**Problem:** Content cut off on right side on mobile.

**Fix:**
- `.dash-panel` padding reduced to `16px` on mobile (already partially done — verify)
- `.dash-main`: `overflow-x:hidden` (already done — verify still present)
- Remove any residual `margin-left` on `.dash-main` at mobile breakpoints

### 6. Earnings Table Overflow

**Problem:** `.et-header` and `.et-row` use a 5-column grid (`1fr 1fr 1fr 100px 100px`) that overflows on narrow screens.

**Fix:**
- Wrap `.earnings-table` in a `div` with `overflow-x:auto` on mobile
- Table keeps its grid columns but becomes horizontally scrollable

### 7. Slot Rows (4-column grid)

**Problem:** `.slot-row` uses `grid-template-columns: auto 1fr auto auto` which can be too wide on phones.

**Fix:**
- On mobile, reflow to 2-row card:
  - Row 1: colour bar + service name + meta (status pill right-aligned)
  - Row 2: price + action buttons
- `grid-template-columns: auto 1fr` on mobile with action area wrapping below

### 8. Panel Header Stack

**Problem:** `.panel-header` is a flex row (title + CTA button). On narrow screens the button may overflow.

**Fix:**
- On mobile: `flex-direction:column; align-items:flex-start; gap:12px`
- Button renders below the title/subtitle

### 9. Login Form Padding

**Problem:** `.lf-body{padding:32px 40px 40px}` — 40px horizontal padding is tight on 375px screens.

**Fix:**
- On mobile: `padding:24px 20px 32px`

---

## Deployment

After all fixes:
1. `git add index.html skorrd-business.html`
2. `git commit`
3. `wrangler pages deploy . --project-name skorrd --branch staging`
4. Verify on device at `staging.skorrd.pages.dev`

---

## Out of Scope

- Map view (has basic mobile treatment already)
- Booking/payment flow mobile polish
- Desktop layout changes

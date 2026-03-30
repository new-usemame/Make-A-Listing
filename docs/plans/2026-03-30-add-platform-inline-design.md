# Inline "+ Platform" Button Design

**Date:** 2026-03-30
**Status:** Approved

## Problem

Users must navigate to Settings to add a custom platform, interrupting their session workflow. We want an inline way to add platforms directly from the session page.

## Design

### UI Changes

**PlatformSelector.svelte** — Add a `+ Platform` pill button at the end of the platform list, styled with a dashed border and `+` icon to distinguish it from toggle pills. Clicking opens the modal.

**New: AddPlatformModal.svelte** — Centered modal overlay:
- Semi-transparent backdrop (click outside or Escape to dismiss)
- X button in top-right corner
- **Name** text input (required)
- **Description** textarea (optional, placeholder: "Formatting rules, character limits, style notes...")
- **Add Platform** submit button + **Cancel** button
- Responsive: ~90% width on mobile, max-width 400px on desktop

### Data Flow

1. User clicks `+ Platform` → modal opens (local state in PlatformSelector)
2. User fills name + description, clicks "Add Platform"
3. `fetch()` POST to `/api/platforms` with name + description
4. Server generates slug from name, inserts into `platforms` table with user's ID
5. Response returns the new platform object (id, name, slug, description)
6. PlatformSelector adds it to the local platform list and auto-selects it
7. Modal closes

### Server-Side

New JSON API route at `/api/platforms/+server.ts`:
- POST handler: validates name, generates slug, inserts platform, returns JSON
- Reuses existing slug generation logic from settings page

### Responsive Behavior

- **Mobile:** Modal ~90% viewport width, inputs stack vertically, min 44px touch targets
- **Desktop:** Modal 400px max-width, centered vertically and horizontally

### Error Handling

- Empty name → inline validation message, don't submit
- Server error → show error text in modal, keep it open

### Behavior Details

- Newly added platform is auto-selected for the current session
- Standard modal dismissal: click outside, Escape key, X button, Cancel button

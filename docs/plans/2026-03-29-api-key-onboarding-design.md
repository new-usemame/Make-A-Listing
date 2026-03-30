# API Key Onboarding Card — Design

## Problem

The only place to enter an OpenRouter API key is buried in Settings. Users with no key land on the session page and can browse freely, but get a raw `alert()` when they try to generate. There's no explanation of what OpenRouter is, how to sign up, or where to find a key.

## Solution

An inline onboarding card at the top of the session page when no API key is configured. The card lets users paste and save their key without leaving the page, and includes expandable step-by-step instructions for non-technical users.

## Design

### New component: `ApiKeySetup.svelte`

Renders at the top of the session page when `!data.hasApiKey`.

**Always visible:**
- Heading: "Set up your API key to start generating listings"
- Subtext: "This app uses OpenRouter to generate listings. You'll need a free account and API key."
- Password input field (placeholder: `sk-or-...`) + Save button

**Expandable section** ("Need help getting a key?"):
1. Go to [openrouter.ai](https://openrouter.ai) and create an account (Google, email, or GitHub)
2. Add credits to your account (starting at $5)
3. Go to [openrouter.ai/keys](https://openrouter.ai/keys) and click "Create Key"
4. Copy the key (starts with `sk-or-`) and paste it above

All links open in new tabs.

**On save:**
- POST to existing `?/updateApiKey` server action
- Success: card transitions to "You're all set! You can change your key or model anytime in Settings." Auto-dismisses after ~3 seconds.
- Error: inline error message below the input

### Changes to session page

- Import and render `ApiKeySetup` at the top when `!data.hasApiKey`
- Remove the `alert()` blocking call on generate
- Remove the amber "API key required" warning link

### Files touched

1. `src/lib/components/ApiKeySetup.svelte` — new
2. `src/routes/app/session/[id]/+page.svelte` — integrate component, remove old warnings

### Not changed

- Server actions, layout, header, settings page, database schema — all stay as-is

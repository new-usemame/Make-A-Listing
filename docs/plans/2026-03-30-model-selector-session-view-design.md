# Design: Model Selector in Session View + Updated Model List

**Date:** 2026-03-30

## Problem

Model selection is buried in Settings. Users should be able to switch models from the main session view without navigating away.

## Solution

### 1. UI: Inline dropdown next to Generate button

Add a compact `<select>` dropdown to the left of the "Generate Listings" button in the session page input area. Shows current model name. Changing it updates `users.preferredModel` in the DB (same behavior as settings page).

**Location:** The `flex items-center justify-between` row — left side has SystemPromptBadge, right side gets `[model dropdown] [Generate button]`.

**Data:** Session page already loads `preferredModel`. Add model list to the server load response by importing from `openrouter.ts`.

**Persistence:** On change, fire a fetch to the existing `updateModel` action on the settings page. Update local state immediately.

### 2. Single source of truth for model list

Remove the duplicated `CURATED_MODELS` from `settings/+page.server.ts`. Import from `$lib/server/openrouter.ts` everywhere.

### 3. Updated model list

Add Claude Sonnet 4.5 as a mid-tier quality option:

| Model ID | Name | Tier | Vision | Tools |
|---|---|---|---|---|
| openai/gpt-4o-mini | GPT-4o Mini | budget | yes | yes |
| openai/gpt-4.1-mini | GPT-4.1 Mini | budget | yes | yes |
| google/gemini-2.5-flash | Gemini 2.5 Flash | fast | yes | yes |
| anthropic/claude-sonnet-4.5 | Claude Sonnet 4.5 | quality | yes | yes |
| anthropic/claude-4.6-sonnet | Claude 4.6 Sonnet | quality | yes | yes |
| anthropic/claude-4.6-opus | Claude 4.6 Opus | best | yes | yes |
| openai/gpt-5.4 | GPT-5.4 | frontier | yes | yes |

### 4. Automated model validation tests

Test file: `src/lib/server/openrouter.test.ts`

For each curated model:
- Send a simple text completion request
- Send a vision request with a sample image
- Models that fail are flagged for removal

Tests require `OPENROUTER_API_KEY` env var; skipped if not set.

# Model Selector in Session View — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a model selector dropdown next to the Generate button in the session view, update the curated model list to include Claude Sonnet 4.5, deduplicate model definitions, and validate all models with automated tests.

**Architecture:** Single source of truth for models in `openrouter.ts`. Session page imports the list and renders a `<select>`. Changing the model fires a fetch to the existing `updateModel` action on the settings route. Tests hit the real OpenRouter API to validate each model supports text and vision.

**Tech Stack:** SvelteKit, TypeScript, Vitest, OpenRouter API (OpenAI SDK)

---

### Task 1: Update CURATED_MODELS in openrouter.ts

**Files:**
- Modify: `src/lib/server/openrouter.ts:16-47`

**Step 1: Add Claude Sonnet 4.5 to the model list**

Insert after the Gemini entry (line 31):

```typescript
export const CURATED_MODELS = [
	{ id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', tier: 'budget', vision: true, tools: true },
	{
		id: 'openai/gpt-4.1-mini',
		name: 'GPT-4.1 Mini',
		tier: 'budget',
		vision: true,
		tools: true
	},
	{
		id: 'google/gemini-2.5-flash',
		name: 'Gemini 2.5 Flash',
		tier: 'fast',
		vision: true,
		tools: true
	},
	{
		id: 'anthropic/claude-sonnet-4.5',
		name: 'Claude Sonnet 4.5',
		tier: 'quality',
		vision: true,
		tools: true
	},
	{
		id: 'anthropic/claude-4.6-sonnet',
		name: 'Claude 4.6 Sonnet',
		tier: 'quality',
		vision: true,
		tools: true
	},
	{
		id: 'anthropic/claude-4.6-opus',
		name: 'Claude 4.6 Opus',
		tier: 'best',
		vision: true,
		tools: true
	},
	{ id: 'openai/gpt-5.4', name: 'GPT-5.4', tier: 'frontier', vision: true, tools: true }
] as const;
```

**Step 2: Update existing unit test for new count**

In `src/lib/server/openrouter.test.ts`, change the length assertion from 6 to 7 and add the new model ID check:

```typescript
it('CURATED_MODELS contains expected entries', () => {
	expect(CURATED_MODELS.length).toBe(7);
	const ids = CURATED_MODELS.map((m) => m.id);
	expect(ids).toContain('openai/gpt-4o-mini');
	expect(ids).toContain('anthropic/claude-sonnet-4.5');
	expect(ids).toContain('anthropic/claude-4.6-sonnet');
});
```

**Step 3: Run tests**

Run: `npx vitest run src/lib/server/openrouter.test.ts`
Expected: All pass

**Step 4: Commit**

```bash
git add src/lib/server/openrouter.ts src/lib/server/openrouter.test.ts
git commit -m "feat: add Claude Sonnet 4.5 to curated models"
```

---

### Task 2: Deduplicate model list — settings imports from openrouter.ts

**Files:**
- Modify: `src/routes/app/settings/+page.server.ts:1-16`

**Step 1: Replace inline CURATED_MODELS with import**

Remove lines 9-16 (the `const CURATED_MODELS = [...]` block) and add import at the top:

```typescript
import { CURATED_MODELS } from '$lib/server/openrouter';
```

The rest of the file already references `CURATED_MODELS` — no other changes needed.

**Step 2: Run the full test suite**

Run: `npx vitest run`
Expected: All 30+ tests pass

**Step 3: Commit**

```bash
git add src/routes/app/settings/+page.server.ts
git commit -m "refactor: deduplicate model list, import from openrouter.ts"
```

---

### Task 3: Pass model list from session page server load

**Files:**
- Modify: `src/routes/app/session/[id]/+page.server.ts`

**Step 1: Add import and return models in load**

Add import at the top:

```typescript
import { CURATED_MODELS } from '$lib/server/openrouter';
```

Add `models: CURATED_MODELS` to the return object (after line 52, `preferredModel`):

```typescript
return {
	session: { id: session.id, title: session.title },
	messages: /* ... existing ... */,
	platforms: /* ... existing ... */,
	hasApiKey: !!user.openrouterApiKey,
	hasSystemPrompt: !!user.systemPrompt,
	preferredModel: user.preferredModel,
	models: CURATED_MODELS.map(m => ({ id: m.id, name: m.name, tier: m.tier }))
};
```

**Step 2: Verify dev server loads without errors**

Run: `npm run build` (type-checks everything)
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/routes/app/session/[id]/+page.server.ts
git commit -m "feat: pass model list to session page"
```

---

### Task 4: Add model selector dropdown to session page UI

**Files:**
- Modify: `src/routes/app/session/[id]/+page.svelte:178-210`

**Step 1: Add selectedModel state and model update function**

After the existing state declarations (around line 19), add:

```typescript
let selectedModel = $state(data.preferredModel);

async function updateModel(modelId: string) {
	selectedModel = modelId;
	const form = new FormData();
	form.append('model', modelId);
	await fetch('/app/settings?/updateModel', {
		method: 'POST',
		body: form,
		headers: { 'x-sveltekit-action': 'true' }
	});
}
```

**Step 2: Add the dropdown next to the Generate button**

Replace the `<div class="flex items-center justify-between">` block (lines 178-210) with:

```svelte
<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<SystemPromptBadge active={data.hasSystemPrompt} />
	</div>

	<div class="flex items-center gap-2">
		<select
			bind:value={selectedModel}
			onchange={(e) => updateModel(e.currentTarget.value)}
			disabled={generating}
			class="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
		>
			{#each data.models as model}
				<option value={model.id}>{model.name}</option>
			{/each}
		</select>

		<button
			type="button"
			onclick={generate}
			disabled={generating || !prompt.trim() || selectedPlatforms.length === 0}
			class="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
		>
			{#if generating}
				<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					></path>
				</svg>
				Generating...
			{:else}
				Generate Listings
			{/if}
		</button>
	</div>
</div>
```

**Step 3: Build and verify**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/routes/app/session/[id]/+page.svelte
git commit -m "feat: add model selector dropdown next to generate button"
```

---

### Task 5: Write OpenRouter model validation tests

**Files:**
- Modify: `src/lib/server/openrouter.test.ts`

**Step 1: Write the validation test suite**

Append to the existing test file. These tests hit the real OpenRouter API. They are skipped when `OPENROUTER_API_KEY` is not set.

```typescript
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';

const apiKey = process.env.OPENROUTER_API_KEY;

describe.skipIf(!apiKey)('OpenRouter model validation (live API)', () => {
	// Small 1x1 red PNG as base64 for vision tests
	const TINY_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

	function makeClient() {
		return new OpenAI({
			baseURL: 'https://openrouter.ai/api/v1',
			apiKey: apiKey!,
			defaultHeaders: {
				'HTTP-Referer': 'https://makealisting.com',
				'X-Title': 'Make a Listing - Model Validation'
			}
		});
	}

	for (const model of CURATED_MODELS) {
		describe(model.name, () => {
			it('handles text completion', async () => {
				const client = makeClient();
				const res = await client.chat.completions.create({
					model: model.id,
					messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
					max_tokens: 10
				});
				expect(res.choices[0]?.message?.content).toBeTruthy();
			}, 30_000);

			it('handles vision (image input)', async () => {
				const client = makeClient();
				const res = await client.chat.completions.create({
					model: model.id,
					messages: [
						{
							role: 'user',
							content: [
								{ type: 'text', text: 'What color is this pixel? Reply with one word.' },
								{
									type: 'image_url',
									image_url: { url: `data:image/png;base64,${TINY_PNG_BASE64}` }
								}
							]
						}
					],
					max_tokens: 10
				});
				expect(res.choices[0]?.message?.content).toBeTruthy();
			}, 30_000);
		});
	}
});
```

**Step 2: Run the validation tests with the API key**

Run: `OPENROUTER_API_KEY=sk-or-v1-... npx vitest run src/lib/server/openrouter.test.ts`
Expected: All models pass both text and vision tests. Any failures indicate a model should be removed from the curated list.

**Step 3: Run without key to verify skip**

Run: `npx vitest run src/lib/server/openrouter.test.ts`
Expected: Live API tests are skipped, existing unit tests still pass.

**Step 4: Commit**

```bash
git add src/lib/server/openrouter.test.ts
git commit -m "test: add live API validation tests for curated models"
```

---

### Task 6: Run validation and remove failing models

**Step 1: Run the full validation suite**

Run: `OPENROUTER_API_KEY=sk-or-v1-... npx vitest run src/lib/server/openrouter.test.ts`

**Step 2: If any model fails, remove it from CURATED_MODELS in openrouter.ts**

**Step 3: Re-run tests to confirm all remaining models pass**

**Step 4: Commit any removals**

```bash
git add src/lib/server/openrouter.ts src/lib/server/openrouter.test.ts
git commit -m "fix: remove models that failed validation"
```

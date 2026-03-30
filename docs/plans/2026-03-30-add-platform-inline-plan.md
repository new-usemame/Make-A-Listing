# Inline "+ Platform" Button Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "+ Platform" button inside PlatformSelector that opens a modal to create a new platform inline, auto-selecting it for the current session.

**Architecture:** New `AddPlatformModal.svelte` component renders a centered modal with name + description fields. A new JSON API route `/api/platforms` handles creation. PlatformSelector gains an `onadd` callback prop to surface newly added platforms to the parent page.

**Tech Stack:** SvelteKit, Svelte 5 runes, Tailwind CSS, SQLite (Drizzle ORM)

---

### Task 1: Create the `/api/platforms` API route

**Files:**
- Create: `src/routes/api/platforms/+server.ts`

**Step 1: Write the test**

Create `src/routes/api/platforms/platforms.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';
import * as schema from '$lib/server/db/schema';

const { platforms } = schema;

function createTestDb() {
	const sqlite = new Database(':memory:');
	sqlite.pragma('foreign_keys = ON');
	const db = drizzle(sqlite, { schema });
	migrate(db, { migrationsFolder: './drizzle' });
	return db;
}

describe('POST /api/platforms', () => {
	let db: ReturnType<typeof createTestDb>;
	const userId = uuid();

	beforeEach(() => {
		db = createTestDb();
		const now = new Date().toISOString();
		db.insert(schema.users).values({
			id: userId,
			username: 'testuser',
			passwordHash: 'hash',
			createdAt: now,
			updatedAt: now
		}).run();
	});

	it('should insert a platform and return it as JSON', () => {
		const name = 'Facebook Marketplace';
		const description = 'Short descriptions, casual tone';
		const slug = 'facebook-marketplace';

		const id = uuid();
		const now = new Date().toISOString();
		db.insert(platforms).values({ id, userId, name, slug, description, createdAt: now }).run();

		const result = db.select().from(platforms).where(eq(platforms.id, id)).get();
		expect(result).toBeDefined();
		expect(result!.name).toBe(name);
		expect(result!.slug).toBe(slug);
		expect(result!.description).toBe(description);
		expect(result!.userId).toBe(userId);
	});

	it('should generate correct slug from name', () => {
		const name = "Aunt Sally's Shop!";
		const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
		expect(slug).toBe('aunt-sally-s-shop');
	});
});
```

**Step 2: Run test to verify it passes**

Run: `npx vitest run src/routes/api/platforms/platforms.test.ts`
Expected: PASS (this tests DB logic only, not the HTTP handler)

**Step 3: Create the API route**

Create `src/routes/api/platforms/+server.ts`:

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { platforms } from '$lib/server/db/schema';
import { v4 as uuid } from 'uuid';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Not authenticated');

	const body = await request.json();
	const name = body.name?.trim();
	const description = body.description?.trim() || null;

	if (!name) throw error(400, 'Platform name is required');

	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

	const id = uuid();
	const now = new Date().toISOString();

	db.insert(platforms)
		.values({ id, userId: locals.user.id, name, slug, description, createdAt: now })
		.run();

	return json({ id, name, slug, description });
};
```

**Step 4: Run tests**

Run: `npx vitest run src/routes/api/platforms/platforms.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/routes/api/platforms/
git commit -m "feat: add POST /api/platforms JSON endpoint"
```

---

### Task 2: Create AddPlatformModal component

**Files:**
- Create: `src/lib/components/AddPlatformModal.svelte`

**Step 1: Create the modal component**

```svelte
<script lang="ts">
	interface Props {
		open: boolean;
		onclose: () => void;
		onadd: (platform: { id: string; name: string; slug: string; description: string | null }) => void;
	}

	let { open, onclose, onadd }: Props = $props();

	let name = $state('');
	let description = $state('');
	let error = $state('');
	let submitting = $state(false);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}

	async function submit() {
		const trimmedName = name.trim();
		if (!trimmedName) {
			error = 'Platform name is required';
			return;
		}

		error = '';
		submitting = true;

		try {
			const res = await fetch('/api/platforms', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: trimmedName, description: description.trim() || null })
			});

			if (!res.ok) {
				const msg = await res.text();
				error = msg || 'Failed to add platform';
				return;
			}

			const platform = await res.json();
			onadd(platform);
			name = '';
			description = '';
			onclose();
		} catch {
			error = 'Something went wrong';
		} finally {
			submitting = false;
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		role="dialog"
		aria-modal="true"
		aria-label="Add a platform"
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		onkeydown={handleKeydown}
	>
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute inset-0 bg-black/40" onclick={handleBackdropClick}></div>

		<!-- Modal -->
		<div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-5 space-y-4">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-900">Add Platform</h2>
				<button
					type="button"
					onclick={onclose}
					class="text-gray-400 hover:text-gray-600 p-1"
					aria-label="Close"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Form -->
			<div class="space-y-3">
				<div>
					<label for="platform-name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
					<input
						id="platform-name"
						type="text"
						bind:value={name}
						placeholder="e.g. Facebook Marketplace"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>

				<div>
					<label for="platform-desc" class="block text-sm font-medium text-gray-700 mb-1">Description <span class="text-gray-400 font-normal">(optional)</span></label>
					<textarea
						id="platform-desc"
						bind:value={description}
						placeholder="Formatting rules, character limits, style notes..."
						rows={3}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					></textarea>
				</div>

				{#if error}
					<p class="text-sm text-red-600">{error}</p>
				{/if}
			</div>

			<!-- Actions -->
			<div class="flex justify-end gap-2 pt-1">
				<button
					type="button"
					onclick={onclose}
					class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={submit}
					disabled={submitting}
					class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
				>
					{submitting ? 'Adding...' : 'Add Platform'}
				</button>
			</div>
		</div>
	</div>
{/if}
```

**Step 2: Verify no syntax errors**

Run: `npx svelte-check --threshold error`
Expected: No errors in AddPlatformModal.svelte

**Step 3: Commit**

```bash
git add src/lib/components/AddPlatformModal.svelte
git commit -m "feat: add AddPlatformModal component"
```

---

### Task 3: Update PlatformSelector with "+ Platform" button

**Files:**
- Modify: `src/lib/components/PlatformSelector.svelte`

**Step 1: Update PlatformSelector**

Add an `onadd` callback prop and the `+ Platform` pill button that opens the modal. Import and render `AddPlatformModal`.

Updated `PlatformSelector.svelte`:

```svelte
<script lang="ts">
	import AddPlatformModal from './AddPlatformModal.svelte';

	interface Platform {
		id: string;
		name: string;
		slug: string;
	}

	interface Props {
		platforms: Platform[];
		selected: string[];
		onchange: (selected: string[]) => void;
		onadd?: (platform: { id: string; name: string; slug: string; description: string | null }) => void;
	}

	let { platforms, selected, onchange, onadd }: Props = $props();

	let showAddModal = $state(false);

	function toggle(id: string) {
		if (selected.includes(id)) {
			onchange(selected.filter((s) => s !== id));
		} else {
			onchange([...selected, id]);
		}
	}

	function handleAdd(platform: { id: string; name: string; slug: string; description: string | null }) {
		onadd?.(platform);
	}
</script>

<div class="flex flex-wrap gap-2 md:flex-wrap overflow-x-auto md:overflow-visible pb-1">
	{#each platforms as platform (platform.id)}
		<button
			type="button"
			onclick={() => toggle(platform.id)}
			class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border {selected.includes(
				platform.id
			)
				? 'bg-blue-600 text-white border-blue-600'
				: 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'}"
		>
			{platform.name}
		</button>
	{/each}

	{#if onadd}
		<button
			type="button"
			onclick={() => (showAddModal = true)}
			class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-600"
		>
			+ Platform
		</button>
	{/if}
</div>

{#if onadd}
	<AddPlatformModal
		open={showAddModal}
		onclose={() => (showAddModal = false)}
		{onadd: handleAdd}
	/>
{/if}
```

**Step 2: Verify no syntax errors**

Run: `npx svelte-check --threshold error`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/components/PlatformSelector.svelte
git commit -m "feat: add + Platform button to PlatformSelector"
```

---

### Task 4: Wire up the session page to handle new platforms

**Files:**
- Modify: `src/routes/app/session/[id]/+page.svelte`

**Step 1: Update session page**

In the session page's `<script>` section, make `platforms` a mutable local copy of `data.platforms`. Add a handler that appends the new platform and auto-selects it.

Changes to `src/routes/app/session/[id]/+page.svelte`:

1. Add a local mutable platforms list:
```typescript
let localPlatforms = $state([...data.platforms]);
```

2. Add handler function:
```typescript
function handlePlatformAdded(platform: { id: string; name: string; slug: string; description: string | null }) {
	localPlatforms = [...localPlatforms, { id: platform.id, name: platform.name, slug: platform.slug }];
	selectedPlatforms = [...selectedPlatforms, platform.id];
}
```

3. Update the `platformName` function to use `localPlatforms`:
```typescript
function platformName(id: string): string {
	return localPlatforms.find((p) => p.id === id)?.name ?? id;
}
```

4. Update the PlatformSelector usage:
```svelte
<PlatformSelector
	platforms={localPlatforms}
	selected={selectedPlatforms}
	onchange={(s) => (selectedPlatforms = s)}
	onadd={handlePlatformAdded}
/>
```

**Step 2: Verify no syntax errors**

Run: `npx svelte-check --threshold error`
Expected: No errors

**Step 3: Manual test**

Run: `npm run dev`
1. Go to a session page
2. Verify "+ Platform" pill appears after existing platforms
3. Click it — modal opens
4. Fill in name "Test Platform" and description
5. Click "Add Platform" — modal closes, new platform appears and is selected
6. Click outside modal / press Escape — modal dismisses
7. Check on mobile viewport (resize to 375px width) — modal is ~90% width, inputs are comfortable

**Step 4: Commit**

```bash
git add src/routes/app/session/[id]/+page.svelte
git commit -m "feat: wire up inline platform creation in session page"
```

---

### Task 5: Run full test suite and verify

**Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (existing + new)

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 3: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: cleanup after inline platform feature"
```

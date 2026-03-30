# API Key Onboarding Card — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an inline API key setup card to the session page so new users can configure their OpenRouter key without navigating to Settings, with expandable help instructions for non-technical users.

**Architecture:** New `ApiKeySetup.svelte` component rendered conditionally at top of session page. POSTs to existing `?/updateApiKey` action on the settings page server endpoint. Session page cleaned up to remove old alert/warning UX.

**Tech Stack:** SvelteKit, Svelte 5 runes, Tailwind CSS, existing server actions

---

### Task 1: Create ApiKeySetup component

**Files:**
- Create: `src/lib/components/ApiKeySetup.svelte`

**Step 1: Create the component file**

```svelte
<script lang="ts">
  let apiKey = $state('');
  let saving = $state(false);
  let error = $state('');
  let success = $state(false);
  let showHelp = $state(false);

  async function saveKey() {
    if (!apiKey.trim()) return;
    saving = true;
    error = '';

    try {
      const res = await fetch('/app/settings?/updateApiKey', {
        method: 'POST',
        body: new URLSearchParams({ apiKey: apiKey.trim() }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (!res.ok) {
        error = 'Failed to save key. Please try again.';
        saving = false;
        return;
      }

      const result = await res.json();
      // SvelteKit form actions return data in a specific format
      if (result.type === 'failure') {
        error = result.data?.error ?? 'Failed to save key.';
        saving = false;
        return;
      }

      success = true;
      setTimeout(() => {
        // Reload to pick up the new hasApiKey state
        window.location.reload();
      }, 3000);
    } catch {
      error = 'Something went wrong. Please try again.';
    } finally {
      saving = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveKey();
    }
  }
</script>

{#if success}
  <section class="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-1">
    <p class="text-green-800 font-semibold">You're all set!</p>
    <p class="text-green-600 text-sm">You can change your key or model anytime in <a href="/app/settings" class="underline font-medium">Settings</a>.</p>
  </section>
{:else}
  <section class="bg-indigo-50 border border-indigo-200 rounded-xl p-6 space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-gray-900">Set up your API key to start generating listings</h2>
      <p class="text-sm text-gray-600 mt-1">This app uses <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline font-medium">OpenRouter</a> to generate listings. You'll need a free account and API key.</p>
    </div>

    <div class="flex gap-3">
      <input
        type="password"
        bind:value={apiKey}
        onkeydown={handleKeydown}
        placeholder="sk-or-..."
        disabled={saving}
        class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
      />
      <button
        type="button"
        onclick={saveKey}
        disabled={saving || !apiKey.trim()}
        class="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? 'Saving...' : 'Save Key'}
      </button>
    </div>

    {#if error}
      <p class="text-sm text-red-600">{error}</p>
    {/if}

    <div>
      <button
        type="button"
        onclick={() => (showHelp = !showHelp)}
        class="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
      >
        <svg class="w-4 h-4 transition-transform {showHelp ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        Need help getting a key?
      </button>

      {#if showHelp}
        <ol class="mt-3 space-y-2 text-sm text-gray-700 list-decimal list-inside">
          <li>
            Go to <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline font-medium">openrouter.ai</a> and create an account (Google, email, or GitHub)
          </li>
          <li>
            Add credits to your account (starting at $5) — this is what pays for the AI models
          </li>
          <li>
            Go to <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline font-medium">openrouter.ai/keys</a> and click <strong>"Create Key"</strong>
          </li>
          <li>
            Copy the key (it starts with <code class="bg-white px-1.5 py-0.5 rounded text-xs border border-gray-200">sk-or-</code>) and paste it above
          </li>
        </ol>
        <p class="mt-2 text-xs text-gray-500">
          The key is only shown once after creation — make sure to copy it right away.
        </p>
      {/if}
    </div>
  </section>
{/if}
```

**Step 2: Verify it compiles**

Run: `cd "/Users/acoundou/Web Apps/ZolanMomEcomListingGenerator" && npx svelte-check --threshold warning 2>&1 | head -20`

**Step 3: Commit**

```bash
git add src/lib/components/ApiKeySetup.svelte
git commit -m "feat: add ApiKeySetup onboarding component"
```

---

### Task 2: Integrate component into session page

**Files:**
- Modify: `src/routes/app/session/[id]/+page.svelte`

**Step 1: Add import and render component**

At the top of the `<script>` block, add import:
```typescript
import ApiKeySetup from '$lib/components/ApiKeySetup.svelte';
```

In the template, right after `<div class="space-y-6">` (line 149) and before the `<!-- Input Area -->` section, add:
```svelte
{#if !data.hasApiKey}
  <ApiKeySetup />
{/if}
```

**Step 2: Remove the alert() call**

In the `generate()` function, remove lines 51-54:
```typescript
if (!data.hasApiKey) {
  alert('Please add your OpenRouter API key in Settings first.');
  return;
}
```

**Step 3: Remove the amber warning link**

Remove lines 181-188 (the `{#if !data.hasApiKey}` block with the amber link):
```svelte
{#if !data.hasApiKey}
  <a
    href="/app/settings"
    class="text-xs text-amber-600 hover:text-amber-700 font-medium"
  >
    API key required
  </a>
{/if}
```

**Step 4: Verify it compiles**

Run: `cd "/Users/acoundou/Web Apps/ZolanMomEcomListingGenerator" && npx svelte-check --threshold warning 2>&1 | head -20`

**Step 5: Test in browser**

Run: `cd "/Users/acoundou/Web Apps/ZolanMomEcomListingGenerator" && npm run dev`

Verify:
- Session page shows the onboarding card when no API key is set
- Card is not shown when API key exists
- Expandable help section works
- Save button posts and reloads on success
- No more alert() or amber warning link

**Step 6: Commit**

```bash
git add src/routes/app/session/[id]/+page.svelte
git commit -m "feat: integrate API key onboarding card into session page"
```

---

### Task 3: Manual QA pass

**Step 1: Test the full flow**

1. Log in as a user with no API key
2. Navigate to a session — verify card appears at top
3. Click "Need help getting a key?" — verify steps expand
4. Verify all links open in new tabs
5. Enter a key and click Save — verify success message appears
6. After reload, verify card is gone and workspace is usable
7. Try generating — verify no alert() pops up

**Step 2: Test edge cases**

1. Try saving an empty key — verify it does nothing
2. Try pressing Enter in the input field — verify it saves
3. Check mobile viewport — verify card is responsive

**Step 3: Final commit if any fixes needed**

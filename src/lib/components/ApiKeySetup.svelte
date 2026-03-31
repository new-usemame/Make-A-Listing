<script lang="ts">
	let apiKey = $state('');
	let saving = $state(false);
	let error = $state('');
	let success = $state(false);
	let helpExpanded = $state(false);

	async function saveKey() {
		const trimmed = apiKey.trim();
		if (!trimmed) {
			error = 'Please enter your API key.';
			return;
		}

		saving = true;
		error = '';

		try {
			const formData = new FormData();
			formData.append('apiKey', trimmed);

			const res = await fetch('/app/settings?/updateApiKey', {
				method: 'POST',
				headers: {
					'x-sveltekit-action': 'true'
				},
				body: formData
			});

			const result = await res.json();

			if (result.type === 'failure') {
				error = result.data?.error || 'Failed to save API key.';
				saving = false;
				return;
			}

			success = true;
			saving = false;
			setTimeout(() => {
				window.location.reload();
			}, 3000);
		} catch {
			error = 'Network error — please try again.';
			saving = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			saveKey();
		}
	}
</script>

{#if success}
	<div class="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
		<div class="text-2xl mb-2">&#10003;</div>
		<h3 class="text-lg font-semibold text-green-800 mb-1">You're all set!</h3>
		<p class="text-sm text-green-700">You can change your key or model anytime in <a href="/app/settings" class="underline font-medium">Settings</a>.</p>
	</div>
{:else}
	<div class="rounded-xl border p-6" style="border-color: var(--blue-light); background: rgba(37, 99, 235, 0.03);">
		<h3 class="text-lg font-semibold mb-1" style="color: var(--navy);">Set up your API key to start generating listings</h3>
		<p class="text-sm mb-4" style="color: var(--navy); opacity: 0.6;">
			This app uses <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" class="underline font-medium" style="color: var(--blue);">OpenRouter</a> to generate listings. You'll need a free account and API key.
		</p>

		<div class="flex gap-2">
			<input
				type="password"
				bind:value={apiKey}
				onkeydown={handleKeydown}
				placeholder="sk-or-..."
				aria-label="OpenRouter API key"
				class="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-[var(--blue)]"
				style="border-color: var(--cream-dark);"
				disabled={saving}
			/>
			<button
				onclick={saveKey}
				disabled={saving}
				class="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed btn-shimmer shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-shadow"
			>
				{saving ? 'Saving...' : 'Save Key'}
			</button>
		</div>

		{#if error}
			<p class="mt-2 text-sm text-red-600">{error}</p>
		{/if}

		<div class="mt-4">
			<button
				onclick={() => helpExpanded = !helpExpanded}
				aria-expanded={helpExpanded}
				class="text-sm font-medium flex items-center gap-1"
				style="color: var(--blue);"
			>
				<span class="text-xs">{helpExpanded ? '▼' : '▶'}</span>
				Need help getting a key?
			</button>

			{#if helpExpanded}
				<ol class="mt-3 ml-5 list-decimal text-sm space-y-1.5" style="color: var(--navy); opacity: 0.7;">
					<li>Go to <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" class="underline" style="color: var(--blue);">openrouter.ai</a> and create an account (Google, email, or GitHub)</li>
					<li>Add credits to your account (starting at $5) — this is what pays for the AI models</li>
					<li>Go to <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" class="underline" style="color: var(--blue);">openrouter.ai/keys</a> and click "Create Key"</li>
					<li>Copy the key (starts with <code class="px-1 rounded text-xs" style="background: var(--cream);">sk-or-</code>) and paste it above</li>
				</ol>
				<p class="mt-2 ml-5 text-xs" style="color: var(--navy); opacity: 0.4;">The key is only shown once after creation — make sure to copy it right away.</p>
			{/if}
		</div>
	</div>
{/if}

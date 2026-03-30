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
	<div class="rounded-xl border border-indigo-200 bg-indigo-50 p-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-1">Set up your API key to start generating listings</h3>
		<p class="text-sm text-gray-600 mb-4">
			This app uses <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-medium">OpenRouter</a> to generate listings. You'll need a free account and API key.
		</p>

		<div class="flex gap-2">
			<input
				type="password"
				bind:value={apiKey}
				onkeydown={handleKeydown}
				placeholder="sk-or-..."
				class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
				disabled={saving}
			/>
			<button
				onclick={saveKey}
				disabled={saving}
				class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
				class="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
			>
				<span class="text-xs">{helpExpanded ? '▼' : '▶'}</span>
				Need help getting a key?
			</button>

			{#if helpExpanded}
				<ol class="mt-3 ml-5 list-decimal text-sm text-gray-700 space-y-1.5">
					<li>Go to <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline">openrouter.ai</a> and create an account (Google, email, or GitHub)</li>
					<li>Add credits to your account (starting at $5) — this is what pays for the AI models</li>
					<li>Go to <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline">openrouter.ai/keys</a> and click "Create Key"</li>
					<li>Copy the key (starts with <code class="bg-indigo-100 px-1 rounded text-xs">sk-or-</code>) and paste it above</li>
				</ol>
				<p class="mt-2 ml-5 text-xs text-gray-500">The key is only shown once after creation — make sure to copy it right away.</p>
			{/if}
		</div>
	</div>
{/if}

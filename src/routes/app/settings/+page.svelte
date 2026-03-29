<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let showPromptEditor = $state(false);
	let promptValue = $state(data.systemPrompt ?? '');
	let newPlatformName = $state('');
	let newPlatformDesc = $state('');

	// Sync when server data changes (e.g. after form submission)
	$effect(() => {
		promptValue = data.systemPrompt ?? '';
	});

	const tierColors: Record<string, string> = {
		budget: 'bg-green-100 text-green-800',
		fast: 'bg-yellow-100 text-yellow-800',
		quality: 'bg-blue-100 text-blue-800',
		best: 'bg-purple-100 text-purple-800',
		frontier: 'bg-red-100 text-red-800'
	};
</script>

<svelte:head>
	<title>Settings — Zolan</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900">Settings</h1>

	<!-- API Key -->
	<section class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-1">OpenRouter API Key</h2>
		<p class="text-sm text-gray-500 mb-4">
			Required for generating listings.
			<a
				href="https://openrouter.ai/keys"
				target="_blank"
				rel="noopener noreferrer"
				class="text-indigo-600 hover:underline"
			>
				Get your key &rarr;
			</a>
		</p>

		{#if data.hasApiKey}
			<p class="text-sm text-gray-600 mb-3">
				Current key: <code class="bg-gray-100 px-2 py-0.5 rounded text-xs">{data.maskedApiKey}</code>
			</p>
		{/if}

		<form method="POST" action="?/updateApiKey" use:enhance class="flex gap-3">
			<input
				type="password"
				name="apiKey"
				placeholder="sk-or-..."
				required
				class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
			/>
			<button
				type="submit"
				class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
			>
				{data.hasApiKey ? 'Update Key' : 'Save Key'}
			</button>
		</form>

		{#if form?.action === 'updateApiKey' && form?.success}
			<p class="mt-2 text-sm text-green-600">API key saved successfully.</p>
		{/if}
		{#if form?.action === 'updateApiKey' && form?.error}
			<p class="mt-2 text-sm text-red-600">{form.error}</p>
		{/if}
	</section>

	<!-- Model Selection -->
	<section class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">Default Model</h2>

		<div class="space-y-2">
			{#each data.models as model}
				<form method="POST" action="?/updateModel" use:enhance>
					<input type="hidden" name="model" value={model.id} />
					<button
						type="submit"
						class="w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors {data.preferredModel === model.id
							? 'border-indigo-500 bg-indigo-50'
							: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-4 h-4 rounded-full border-2 flex items-center justify-center {data.preferredModel === model.id
									? 'border-indigo-600'
									: 'border-gray-300'}"
							>
								{#if data.preferredModel === model.id}
									<div class="w-2 h-2 rounded-full bg-indigo-600"></div>
								{/if}
							</div>
							<span class="text-sm font-medium text-gray-900">{model.name}</span>
						</div>
						<span class="text-xs font-medium px-2 py-0.5 rounded-full {tierColors[model.tier] ?? 'bg-gray-100 text-gray-600'}">
							{model.tier}
						</span>
					</button>
				</form>
			{/each}
		</div>

		{#if form?.action === 'updateModel' && form?.success}
			<p class="mt-3 text-sm text-green-600">Model updated.</p>
		{/if}
	</section>

	<!-- System Prompt -->
	<section class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<h2 class="text-lg font-semibold text-gray-900">System Prompt</h2>
				{#if data.systemPrompt}
					<span class="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">Active</span>
				{/if}
			</div>
			<button
				type="button"
				onclick={() => (showPromptEditor = !showPromptEditor)}
				class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
			>
				{showPromptEditor ? 'Collapse' : 'Edit'}
			</button>
		</div>

		{#if !showPromptEditor && data.systemPrompt}
			<p class="text-sm text-gray-600 line-clamp-2">{data.systemPrompt}</p>
		{/if}

		{#if showPromptEditor}
			<form method="POST" action="?/updateSystemPrompt" use:enhance>
				<textarea
					name="systemPrompt"
					bind:value={promptValue}
					rows="6"
					placeholder="Custom instructions for all listing generations..."
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
				></textarea>
				<div class="flex gap-2 mt-3">
					<button
						type="submit"
						class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
					>
						Save Prompt
					</button>
					{#if data.systemPrompt}
						<button
							type="submit"
							onclick={() => (promptValue = '')}
							class="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
						>
							Clear
						</button>
					{/if}
				</div>
			</form>

			{#if form?.action === 'updateSystemPrompt' && form?.success}
				<p class="mt-2 text-sm text-green-600">System prompt updated.</p>
			{/if}
		{/if}
	</section>

	<!-- Platforms -->
	<section class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">Platforms</h2>

		<div class="space-y-2 mb-6">
			{#each data.platforms as platform}
				<div class="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200">
					<div>
						<div class="flex items-center gap-2">
							<span class="text-sm font-medium text-gray-900">{platform.name}</span>
							<span
								class="text-xs font-medium px-2 py-0.5 rounded-full {platform.isDefault
									? 'bg-gray-100 text-gray-600'
									: 'bg-indigo-100 text-indigo-700'}"
							>
								{platform.isDefault ? 'default' : 'custom'}
							</span>
						</div>
						{#if platform.description}
							<p class="text-xs text-gray-500 mt-0.5">{platform.description}</p>
						{/if}
					</div>
					{#if !platform.isDefault}
						<form method="POST" action="?/removePlatform" use:enhance>
							<input type="hidden" name="platformId" value={platform.id} />
							<button
								type="submit"
								class="text-xs text-red-600 hover:text-red-700 font-medium"
							>
								Remove
							</button>
						</form>
					{/if}
				</div>
			{/each}
		</div>

		<form
			method="POST"
			action="?/addPlatform"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					newPlatformName = '';
					newPlatformDesc = '';
				};
			}}
			class="border-t border-gray-200 pt-4"
		>
			<h3 class="text-sm font-medium text-gray-700 mb-3">Add Custom Platform</h3>
			<div class="space-y-3">
				<input
					type="text"
					name="name"
					bind:value={newPlatformName}
					placeholder="Platform name"
					required
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
				/>
				<input
					type="text"
					name="description"
					bind:value={newPlatformDesc}
					placeholder="Brief description (optional)"
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
				/>
				<button
					type="submit"
					class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
				>
					Add Platform
				</button>
			</div>
		</form>

		{#if form?.action === 'addPlatform' && form?.success}
			<p class="mt-2 text-sm text-green-600">Platform added.</p>
		{/if}
		{#if form?.action === 'removePlatform' && form?.success}
			<p class="mt-2 text-sm text-green-600">Platform removed.</p>
		{/if}
	</section>

	<!-- Logout -->
	<div class="text-center py-4">
		<form method="POST" action="?/logout" use:enhance>
			<button type="submit" class="text-sm text-gray-500 hover:text-red-600 transition-colors">
				Sign out
			</button>
		</form>
	</div>
</div>

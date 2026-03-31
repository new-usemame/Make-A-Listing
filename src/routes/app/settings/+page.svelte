<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let showPromptEditor = $state(false);
	let promptValue = $state('');
	let newPlatformName = $state('');
	let newPlatformDesc = $state('');

	// Sync prompt text when server data changes (e.g. after form submission)
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
	<title>Settings — Make a Listing</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="font-serif text-2xl tracking-tight" style="color: var(--navy);">Settings</h1>

	<!-- API Key -->
	<section class="bg-white rounded-xl border p-6" style="border-color: var(--cream-dark); box-shadow: 0 1px 3px rgba(12, 18, 34, 0.04);">
		<h2 class="text-lg font-semibold mb-1" style="color: var(--navy);">OpenRouter API Key</h2>
		<p class="text-sm mb-4" style="color: var(--navy); opacity: 0.5;">
			Required for generating listings.
			<a
				href="https://openrouter.ai/keys"
				target="_blank"
				rel="noopener noreferrer"
				style="color: var(--blue);"
				class="hover:underline"
			>
				Get your key &rarr;
			</a>
		</p>

		{#if data.hasApiKey}
			<p class="text-sm mb-3" style="color: var(--navy); opacity: 0.6;">
				Current key: <code class="px-2 py-0.5 rounded text-xs" style="background: var(--cream);">{data.maskedApiKey}</code>
			</p>
		{/if}

		<form method="POST" action="?/updateApiKey" use:enhance class="flex gap-3">
			<input
				type="password"
				name="apiKey"
				placeholder="sk-or-..."
				required
				class="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent"
				style="border-color: var(--cream-dark);"
			/>
			<button
				type="submit"
				class="px-4 py-2 text-white text-sm font-medium rounded-lg transition-shadow btn-shimmer shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35"
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
	<section class="bg-white rounded-xl border p-6" style="border-color: var(--cream-dark); box-shadow: 0 1px 3px rgba(12, 18, 34, 0.04);">
		<h2 class="text-lg font-semibold mb-4" style="color: var(--navy);">Default Model</h2>

		<div class="space-y-2">
			{#each data.models as model}
				<form method="POST" action="?/updateModel" use:enhance>
					<input type="hidden" name="model" value={model.id} />
					<button
						type="submit"
						class="w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all {data.preferredModel === model.id
							? 'border-[var(--blue)] shadow-sm'
							: 'hover:shadow-sm'}"
						style={data.preferredModel === model.id
							? 'background: rgba(37, 99, 235, 0.04);'
							: `border-color: var(--cream-dark);`}
					>
						<div class="flex items-center gap-3">
							<div
								class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
								style={data.preferredModel === model.id
									? 'border-color: var(--blue);'
									: 'border-color: var(--cream-dark);'}
							>
								{#if data.preferredModel === model.id}
									<div class="w-2 h-2 rounded-full" style="background: var(--blue);"></div>
								{/if}
							</div>
							<span class="text-sm font-medium" style="color: var(--navy);">{model.name}</span>
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
	<section class="bg-white rounded-xl border p-6" style="border-color: var(--cream-dark); box-shadow: 0 1px 3px rgba(12, 18, 34, 0.04);">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<h2 class="text-lg font-semibold" style="color: var(--navy);">System Prompt</h2>
				{#if data.systemPrompt}
					<span class="text-xs font-medium px-2 py-0.5 rounded-full" style="background: rgba(245, 158, 11, 0.1); color: #b45309;">Active</span>
				{/if}
			</div>
			<button
				type="button"
				onclick={() => (showPromptEditor = !showPromptEditor)}
				class="text-sm font-medium"
				style="color: var(--blue);"
			>
				{showPromptEditor ? 'Collapse' : 'Edit'}
			</button>
		</div>

		{#if !showPromptEditor && data.systemPrompt}
			<p class="text-sm line-clamp-2" style="color: var(--navy); opacity: 0.6;">{data.systemPrompt}</p>
		{/if}

		{#if showPromptEditor}
			<form method="POST" action="?/updateSystemPrompt" use:enhance>
				<textarea
					name="systemPrompt"
					bind:value={promptValue}
					rows="6"
					placeholder="Custom instructions for all listing generations..."
					class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent resize-y"
					style="border-color: var(--cream-dark);"
				></textarea>
				<div class="flex gap-2 mt-3">
					<button
						type="submit"
						class="px-4 py-2 text-white text-sm font-medium rounded-lg transition-shadow btn-shimmer shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35"
					>
						Save Prompt
					</button>
					{#if data.systemPrompt}
						<button
							type="submit"
							onclick={() => (promptValue = '')}
							class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
							style="background: var(--cream); color: var(--navy);"
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
	<section class="bg-white rounded-xl border p-6" style="border-color: var(--cream-dark); box-shadow: 0 1px 3px rgba(12, 18, 34, 0.04);">
		<h2 class="text-lg font-semibold mb-4" style="color: var(--navy);">Platforms</h2>

		<div class="space-y-2 mb-6">
			{#each data.platforms as platform}
				<div class="flex items-center justify-between px-4 py-3 rounded-lg border" style="border-color: var(--cream-dark);">
					<div>
						<div class="flex items-center gap-2">
							<span class="text-sm font-medium" style="color: var(--navy);">{platform.name}</span>
							<span
								class="text-xs font-medium px-2 py-0.5 rounded-full"
								style={platform.isDefault
									? 'background: var(--cream); color: var(--navy); opacity: 0.6;'
									: 'background: rgba(37, 99, 235, 0.1); color: var(--blue);'}
							>
								{platform.isDefault ? 'default' : 'custom'}
							</span>
						</div>
						{#if platform.description}
							<p class="text-xs mt-0.5" style="color: var(--navy); opacity: 0.5;">{platform.description}</p>
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
			class="border-t pt-4"
			style="border-color: var(--cream-dark);"
		>
			<h3 class="text-sm font-medium mb-3" style="color: var(--navy); opacity: 0.7;">Add Custom Platform</h3>
			<div class="space-y-3">
				<input
					type="text"
					name="name"
					bind:value={newPlatformName}
					placeholder="Platform name"
					required
					class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent"
					style="border-color: var(--cream-dark);"
				/>
				<input
					type="text"
					name="description"
					bind:value={newPlatformDesc}
					placeholder="Brief description (optional)"
					class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent"
					style="border-color: var(--cream-dark);"
				/>
				<button
					type="submit"
					class="px-4 py-2 text-white text-sm font-medium rounded-lg transition-shadow btn-shimmer shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35"
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
			<button type="submit" class="text-sm transition-colors hover:text-red-600" style="color: var(--navy); opacity: 0.5;">
				Sign out
			</button>
		</form>
	</div>
</div>

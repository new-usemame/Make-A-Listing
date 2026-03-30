<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import PlatformSelector from '$lib/components/PlatformSelector.svelte';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import SystemPromptBadge from '$lib/components/SystemPromptBadge.svelte';
	import ApiKeySetup from '$lib/components/ApiKeySetup.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let addedPlatforms = $state<Array<{ id: string; name: string; slug: string }>>([]);
	let allPlatforms = $derived([
		...data.platforms,
		...addedPlatforms.filter((ap) => !data.platforms.some((dp) => dp.id === ap.id))
	]);
	let prompt = $state('');
	let selectedPlatforms = $state<string[]>([]);
	let images = $state<File[]>([]);
	let pdfFile = $state<File | null>(null);
	let generating = $state(false);
	let streamingListings = $state<Record<string, string>>({});
	let expandedCards = $state<Record<string, boolean>>({});
	let expandedHistory = $state<Record<string, boolean>>({});
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

	function renderMarkdown(md: string): string {
		return DOMPurify.sanitize(marked.parse(md) as string);
	}

	function handlePlatformAdded(platform: { id: string; name: string; slug: string; description: string | null }) {
		addedPlatforms = [...addedPlatforms, { id: platform.id, name: platform.name, slug: platform.slug }];
		selectedPlatforms = [...selectedPlatforms, platform.id];
	}

	function platformName(id: string): string {
		return allPlatforms.find((p) => p.id === id)?.name ?? id;
	}

	function preview(md: string, maxLen = 120): string {
		const text = md.replace(/[#*_`>\-\[\]()]/g, '').trim();
		return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
	}

	async function copyRawMd(md: string) {
		await navigator.clipboard.writeText(md);
	}

	async function copyText(md: string) {
		const text = md.replace(/[#*_`>\-\[\]()]/g, '').trim();
		await navigator.clipboard.writeText(text);
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
			e.preventDefault();
			generate();
		}
	}

	async function generate() {
		if (!prompt.trim() || selectedPlatforms.length === 0 || generating) return;
		generating = true;
		streamingListings = {};

		// Initialize streaming state for each selected platform
		for (const pid of selectedPlatforms) {
			streamingListings[pid] = '';
			expandedCards[pid] = true;
		}

		const formData = new FormData();
		formData.append('prompt', prompt.trim());
		formData.append('platforms', JSON.stringify(selectedPlatforms));
		formData.append('sessionId', data.session.id);

		for (const img of images) {
			formData.append('images', img);
		}
		if (pdfFile) {
			formData.append('pdf', pdfFile);
		}

		try {
			const res = await fetch('/api/generate', {
				method: 'POST',
				body: formData
			});

			if (!res.ok) {
				const errText = await res.text();
				alert(`Generation failed: ${errText}`);
				generating = false;
				return;
			}

			const reader = res.body?.getReader();
			if (!reader) {
				alert('No response stream available');
				generating = false;
				return;
			}

			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() ?? '';

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const payload = line.slice(6).trim();
						if (payload === '[DONE]') continue;

						try {
							const event = JSON.parse(payload);

							if (event.type === 'token' && event.platformId) {
								streamingListings[event.platformId] =
									(streamingListings[event.platformId] ?? '') + event.content;
							} else if (event.type === 'error') {
								console.error('Stream error:', event.message);
							}
						} catch {
							// skip malformed JSON
						}
					}
				}
			}

			// Done streaming - reload to get persisted data
			prompt = '';
			images = [];
			pdfFile = null;
			selectedPlatforms = [];
			await invalidateAll();
		} catch (err) {
			console.error('Generate error:', err);
			alert('An error occurred during generation.');
		} finally {
			generating = false;
			streamingListings = {};
		}
	}
</script>

<svelte:head>
	<title>{data.session.title || 'New Session'} - Make a Listing</title>
</svelte:head>

<div class="space-y-6">
	{#if !data.hasApiKey}
		<ApiKeySetup />
	{/if}

	<!-- Input Area -->
	<section class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
		<FileUpload
			{images}
			{pdfFile}
			onImagesChange={(f) => (images = f)}
			onPdfChange={(f) => (pdfFile = f)}
		/>

		<textarea
			bind:value={prompt}
			onkeydown={handleKeydown}
			placeholder="Describe your product... (Cmd/Ctrl+Enter to generate)"
			rows={4}
			disabled={generating}
			class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
		></textarea>

		<div class="space-y-3">
			<div role="group" aria-label="Select platforms">
				<span class="block text-xs font-medium text-gray-500 mb-1.5">Select platforms</span>
				<PlatformSelector
					platforms={allPlatforms}
					selected={selectedPlatforms}
					onchange={(s) => (selectedPlatforms = s)}
					onadd={handlePlatformAdded}
				/>
			</div>

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
		</div>
	</section>

	<!-- Streaming Results -->
	{#if Object.keys(streamingListings).length > 0}
		<section class="space-y-3">
			<h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">
				Generating Listings
			</h2>
			{#each Object.entries(streamingListings) as [platformId, content] (platformId)}
				<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
					<button
						type="button"
						class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
						onclick={() => (expandedCards[platformId] = !expandedCards[platformId])}
					>
						<span class="font-medium text-gray-900">{platformName(platformId)}</span>
						<svg
							class="w-5 h-5 text-gray-400 transition-transform {expandedCards[platformId]
								? 'rotate-180'
								: ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>

					{#if expandedCards[platformId]}
						<div class="border-t border-gray-100 px-4 py-3">
							{#if content}
								<div class="prose prose-sm max-w-none">
									{@html renderMarkdown(content)}
								</div>
								<div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
									<button
										type="button"
										onclick={() => copyRawMd(content)}
										class="text-xs px-2.5 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
									>
										Copy Raw MD
									</button>
									<button
										type="button"
										onclick={() => copyText(content)}
										class="text-xs px-2.5 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
									>
										Copy Text
									</button>
								</div>
							{:else}
								<div class="flex items-center gap-2 text-sm text-gray-400">
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
									Waiting for tokens...
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</section>
	{/if}

	<!-- Previous Messages -->
	{#if data.messages.length > 0}
		<section class="space-y-3">
			<h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">
				Previous Messages
			</h2>
			{#each data.messages as message (message.id)}
				<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
					<button
						type="button"
						class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
						onclick={() =>
							(expandedHistory[message.id] = !expandedHistory[message.id])}
					>
						<div class="flex items-center gap-2 min-w-0">
							<span
								class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full {message.role ===
								'user'
									? 'bg-blue-100 text-blue-700'
									: 'bg-green-100 text-green-700'}"
							>
								{message.role}
							</span>
							<span class="text-sm text-gray-600 truncate">{preview(message.content)}</span>
						</div>
						<svg
							class="w-5 h-5 text-gray-400 shrink-0 transition-transform {expandedHistory[
								message.id
							]
								? 'rotate-180'
								: ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>

					{#if expandedHistory[message.id]}
						<div class="border-t border-gray-100 px-4 py-3 space-y-3">
							{#if message.images.length > 0}
								<div class="flex flex-wrap gap-2">
									{#each message.images as img, i (i)}
										<img
											src={img}
											alt="Attached image {i + 1}"
											class="w-20 h-20 object-cover rounded-md border border-gray-200"
										/>
									{/each}
								</div>
							{/if}

							<div class="prose prose-sm max-w-none">
								{@html renderMarkdown(message.content)}
							</div>

							{#if message.listings.length > 0}
								<div class="space-y-2 mt-3 pt-3 border-t border-gray-100">
									<h4 class="text-xs font-semibold text-gray-500 uppercase">Listings</h4>
									{#each message.listings as listing (listing.id)}
										{@const expanded = expandedHistory[`listing-${listing.id}`]}
										<div class="border border-gray-200 rounded-lg overflow-hidden">
											<button
												type="button"
												class="w-full px-3 py-2 flex items-center justify-between text-left text-sm hover:bg-gray-50"
												onclick={() =>
													(expandedHistory[`listing-${listing.id}`] = !expanded)}
											>
												<span class="font-medium text-gray-800">
													{platformName(listing.platformId)}
												</span>
												<svg
													class="w-4 h-4 text-gray-400 transition-transform {expanded
														? 'rotate-180'
														: ''}"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 9l-7 7-7-7"
													/>
												</svg>
											</button>

											{#if expanded}
												<div class="border-t border-gray-100 px-3 py-2">
													<div class="prose prose-sm max-w-none">
														{@html renderMarkdown(listing.markdownContent)}
													</div>
													<div class="flex gap-2 mt-2 pt-2 border-t border-gray-100">
														<button
															type="button"
															onclick={() => copyRawMd(listing.markdownContent)}
															class="text-xs px-2.5 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
														>
															Copy Raw MD
														</button>
														<button
															type="button"
															onclick={() => copyText(listing.markdownContent)}
															class="text-xs px-2.5 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
														>
															Copy Text
														</button>
													</div>
												</div>
											{/if}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</section>
	{/if}
</div>

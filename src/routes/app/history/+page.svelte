<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let bulkMode = $state(false);
	let selected = $state<Set<string>>(new Set());
	let searchValue = $state('');

	function toggleSelect(id: string) {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selected = next;
	}

	function exitBulkMode() {
		bulkMode = false;
		selected = new Set();
	}

	function relativeDate(iso: string): string {
		const date = new Date(iso);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 30) return `${diffDays} days ago`;
		if (diffDays < 365) {
			const months = Math.floor(diffDays / 30);
			return months === 1 ? '1 month ago' : `${months} months ago`;
		}
		const years = Math.floor(diffDays / 365);
		return years === 1 ? '1 year ago' : `${years} years ago`;
	}

	function truncate(text: string, max: number): string {
		return text.length > max ? text.slice(0, max) + '...' : text;
	}
</script>

<div class="space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h1 class="font-serif text-2xl tracking-tight" style="color: var(--navy);">History</h1>
		{#if data.sessions.length > 0}
			{#if bulkMode}
				<button
					type="button"
					onclick={exitBulkMode}
					class="text-sm font-medium transition-colors"
					style="color: var(--navy); opacity: 0.6;"
				>
					Cancel
				</button>
			{:else}
				<button
					type="button"
					onclick={() => (bulkMode = true)}
					class="text-sm font-medium"
					style="color: var(--blue);"
				>
					Select
				</button>
			{/if}
		{/if}
	</div>

	<!-- Search -->
	<form method="get" class="relative">
		<svg
			class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
			style="color: var(--navy); opacity: 0.3;"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
		<input
			type="text"
			name="q"
			placeholder="Search sessions..."
			bind:value={searchValue}
			class="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--blue)] focus:border-transparent"
			style="border-color: var(--cream-dark);"
		/>
	</form>

	<!-- Session list -->
	{#if data.sessions.length === 0}
		<div class="text-center py-16">
			<svg
				class="mx-auto w-12 h-12 mb-4"
				style="color: var(--navy); opacity: 0.2;"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="1.5"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<p class="mb-2" style="color: var(--navy); opacity: 0.5;">
				{#if data.query}
					No sessions match "{data.query}"
				{:else}
					No sessions yet
				{/if}
			</p>
			{#if !data.query}
				<a href="/app" class="text-sm font-medium" style="color: var(--blue);">
					Create your first listing
				</a>
			{/if}
		</div>
	{:else}
		<div class="space-y-2">
			{#each data.sessions as session (session.id)}
				<div class="bg-white rounded-lg border px-4 py-3 flex items-center gap-3 transition-all hover:shadow-sm" style="border-color: var(--cream-dark);">
					{#if bulkMode}
						<input
							type="checkbox"
							checked={selected.has(session.id)}
							onchange={() => toggleSelect(session.id)}
							class="w-5 h-5 rounded text-[var(--blue)] focus:ring-[var(--blue)] shrink-0"
							style="border-color: var(--cream-dark);"
						/>
					{/if}

					<button
						type="button"
						onclick={() => goto(`/app/session/${session.id}`)}
						class="flex-1 min-w-0 text-left"
					>
						<div class="flex items-center justify-between gap-2">
							<span class="font-medium truncate" style="color: var(--navy);">
								{truncate(session.title, 50)}
							</span>
							<span class="text-xs whitespace-nowrap shrink-0" style="color: var(--navy); opacity: 0.35;">
								{relativeDate(session.updatedAt)}
							</span>
						</div>
						<div class="flex items-center gap-2 mt-1">
							{#each session.platforms as platform}
								<span class="text-xs px-2 py-0.5 rounded-full" style="background: var(--cream); color: var(--navy); opacity: 0.6;">
									{platform}
								</span>
							{/each}
							<span class="text-xs" style="color: var(--navy); opacity: 0.35;">
								{session.messageCount} message{session.messageCount !== 1 ? 's' : ''}
							</span>
						</div>
					</button>

					{#if !bulkMode}
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => {
								return async ({ update }) => {
									await update();
								};
							}}
						>
							<input type="hidden" name="sessionId" value={session.id} />
							<button
								type="submit"
								class="p-2 transition-colors shrink-0 hover:text-red-500"
								style="color: var(--navy); opacity: 0.3;"
								title="Delete session"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</form>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Bulk delete button -->
		{#if bulkMode && selected.size > 0}
			<form
				method="POST"
				action="?/bulkDelete"
				use:enhance={() => {
					return async ({ update }) => {
						exitBulkMode();
						await update();
					};
				}}
				class="sticky bottom-20 md:bottom-4"
			>
				{#each [...selected] as id}
					<input type="hidden" name="sessionIds" value={id} />
				{/each}
				<button
					type="submit"
					class="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
				>
					Delete {selected.size} session{selected.size !== 1 ? 's' : ''}
				</button>
			</form>
		{/if}
	{/if}
</div>

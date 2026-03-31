<script lang="ts">
	interface Props {
		title?: string;
		username: string;
	}

	let { title, username }: Props = $props();
</script>

<header class="sticky top-0 z-40 glass border-b" style="border-color: var(--cream-dark);">
	<div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<a href="/app" class="font-serif text-xl tracking-tight hover:opacity-80 transition-opacity" style="color: var(--navy);">Make a Listing</a>
			{#if title}
				<span class="hidden md:inline text-sm truncate max-w-xs" style="color: var(--navy); opacity: 0.5;">{title}</span>
			{/if}
		</div>

		<nav class="hidden md:flex items-center gap-4">
			<a
				href="/app"
				class="text-sm font-medium flex items-center gap-1 transition-colors hover:opacity-100"
				style="color: var(--navy); opacity: 0.6;"
			>
				+ New
			</a>
			<a href="/app/history" class="text-sm font-medium transition-colors hover:opacity-100"
				style="color: var(--navy); opacity: 0.6;">
				History
			</a>
			<a href="/app/settings" class="text-sm font-medium transition-colors hover:opacity-100"
				style="color: var(--navy); opacity: 0.6;">
				Settings
			</a>
			<span class="text-sm" style="color: var(--cream-dark);">|</span>
			<span class="text-sm font-medium" style="color: var(--navy);">{username}</span>
		</nav>
	</div>
</header>

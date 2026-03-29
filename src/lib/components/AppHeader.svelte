<script lang="ts">
	interface Props {
		title?: string;
		username: string;
	}

	let { title, username }: Props = $props();
</script>

<header class="sticky top-0 z-40 bg-white border-b border-gray-200">
	<div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<a href="/app" class="text-xl font-bold text-blue-600 hover:text-blue-700">Zolan</a>
			{#if title}
				<span class="hidden md:inline text-sm text-gray-500 truncate max-w-xs">{title}</span>
			{/if}
		</div>

		<nav class="hidden md:flex items-center gap-4">
			<a
				href="/app"
				class="text-sm text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1"
			>
				+ New
			</a>
			<a href="/app/history" class="text-sm text-gray-600 hover:text-blue-600 font-medium">
				History
			</a>
			<a href="/app/settings" class="text-sm text-gray-600 hover:text-blue-600 font-medium">
				Settings
			</a>
			<span class="text-sm text-gray-400">|</span>
			<span class="text-sm text-gray-700 font-medium">{username}</span>
		</nav>
	</div>
</header>

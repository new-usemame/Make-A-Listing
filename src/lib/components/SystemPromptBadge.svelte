<script lang="ts">
	interface Props {
		active: boolean;
	}

	let { active }: Props = $props();
</script>

{#if active}
	<a
		href="/app/settings"
		class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors"
		style="background: rgba(245, 158, 11, 0.1); color: #b45309;"
	>
		<span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: var(--amber);"></span>
		System prompt active
	</a>
{/if}

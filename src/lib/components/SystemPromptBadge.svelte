<script lang="ts">
	interface Props {
		active: boolean;
	}

	let { active }: Props = $props();
</script>

{#if active}
	<a
		href="/app/settings"
		class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
	>
		<span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
		System prompt active
	</a>
{/if}

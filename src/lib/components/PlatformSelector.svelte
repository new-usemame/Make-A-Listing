<script lang="ts">
	import AddPlatformModal from './AddPlatformModal.svelte';

	interface Platform {
		id: string;
		name: string;
		slug: string;
	}

	interface Props {
		platforms: Platform[];
		selected: string[];
		onchange: (selected: string[]) => void;
		onadd?: (platform: { id: string; name: string; slug: string; description: string | null }) => void;
	}

	let { platforms, selected, onchange, onadd }: Props = $props();

	let showAddModal = $state(false);

	function toggle(id: string) {
		if (selected.includes(id)) {
			onchange(selected.filter((s) => s !== id));
		} else {
			onchange([...selected, id]);
		}
	}
</script>

<div class="flex flex-wrap gap-2 md:flex-wrap overflow-x-auto md:overflow-visible pb-1">
	{#each platforms as platform (platform.id)}
		<button
			type="button"
			onclick={() => toggle(platform.id)}
			class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border {selected.includes(
				platform.id
			)
				? 'bg-blue-600 text-white border-blue-600'
				: 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'}"
		>
			{platform.name}
		</button>
	{/each}

	{#if onadd}
		<button
			type="button"
			onclick={() => (showAddModal = true)}
			class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-600"
		>
			+ Platform
		</button>
	{/if}
</div>

{#if onadd}
	<AddPlatformModal
		open={showAddModal}
		onclose={() => (showAddModal = false)}
		onadd={(p) => onadd?.(p)}
	/>
{/if}

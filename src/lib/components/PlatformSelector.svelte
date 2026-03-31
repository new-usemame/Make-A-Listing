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
			class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all border {selected.includes(
				platform.id
			)
				? 'bg-[var(--blue)] text-white border-[var(--blue)] shadow-sm shadow-blue-500/20'
				: 'bg-white/60 border-[var(--cream-dark)] hover:border-[var(--blue-light)] hover:text-[var(--blue)]'}"
			style={selected.includes(platform.id) ? '' : 'color: var(--navy);'}
		>
			{platform.name}
		</button>
	{/each}

	{#if onadd}
		<button
			type="button"
			onclick={() => (showAddModal = true)}
			class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all border border-dashed hover:border-[var(--blue-light)] hover:text-[var(--blue)]"
			style="border-color: var(--cream-dark); color: var(--navy); opacity: 0.4;"
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

<script lang="ts">
	interface Platform {
		id: string;
		name: string;
		slug: string;
	}

	interface Props {
		platforms: Platform[];
		selected: string[];
		onchange: (selected: string[]) => void;
	}

	let { platforms, selected, onchange }: Props = $props();

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
</div>

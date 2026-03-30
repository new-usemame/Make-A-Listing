<script lang="ts">
	import { onMount } from 'svelte';
	import { ebayLogo, poshmarkLogo, mercariLogo, depopLogo } from './icons';

	let section: HTMLElement;
	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
			{ threshold: 0.2 }
		);
		section.querySelectorAll('.reveal').forEach(el => observer.observe(el));
		return () => observer.disconnect();
	});
</script>

<section bind:this={section} class="relative py-20 sm:py-28" style="background: var(--cream);">
	<div class="mx-auto max-w-5xl px-5 sm:px-8 text-center">
		<p class="reveal text-sm font-semibold uppercase tracking-[0.2em] text-[var(--blue)] mb-4">Compatible Platforms</p>
		<h2 class="reveal reveal-delay-1 font-serif text-3xl sm:text-4xl lg:text-5xl text-[var(--navy)] leading-tight">
			One Description.<br class="hidden sm:block" />
			<span class="italic" style="color: var(--blue);">Every Platform.</span>
		</h2>

		<div class="reveal reveal-delay-2 mt-14 flex items-center justify-center flex-wrap gap-8 sm:gap-12">
			{#each [ebayLogo, poshmarkLogo, mercariLogo, depopLogo] as logo}
				<div class="platform-glow w-28 sm:w-32 h-12 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
					{@html logo}
				</div>
			{/each}
			<span class="platform-glow rounded-full border-2 border-dashed border-[var(--navy)]/20 px-5 py-2.5
				text-sm font-semibold text-[var(--navy)]/50 hover:border-[var(--blue)] hover:text-[var(--blue)] transition-colors cursor-default">
				+ Custom
			</span>
		</div>

		<p class="reveal reveal-delay-3 mt-8 text-[var(--navy)]/40 text-sm">
			Perfectly formatted for each platform's rules, character limits, and keyword strategies.
		</p>
	</div>
</section>

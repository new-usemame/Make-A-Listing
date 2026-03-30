<script lang="ts">
	import { onMount } from 'svelte';

	let { authenticated = false }: { authenticated: boolean } = $props();

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

<section bind:this={section} class="relative py-24 sm:py-32 overflow-hidden" style="background: var(--navy);">
	<div class="absolute inset-0 grain"></div>

	<!-- Decorative gradient orbs -->
	<div class="absolute top-0 left-1/4 h-64 w-64 rounded-full opacity-20 blur-3xl"
		style="background: var(--blue);"></div>
	<div class="absolute bottom-0 right-1/4 h-48 w-48 rounded-full opacity-15 blur-3xl"
		style="background: var(--amber);"></div>

	<div class="relative z-10 mx-auto max-w-3xl px-5 sm:px-8 text-center">
		<h2 class="reveal font-serif text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
			Ready to List<br/>
			<span class="italic" style="color: var(--amber);">Smarter?</span>
		</h2>
		<p class="reveal reveal-delay-1 mt-6 text-lg text-white/40">
			Join resellers who are saving hours on every listing.
		</p>
		<div class="reveal reveal-delay-2 mt-10">
			{#if authenticated}
				<a
					href="/app"
					class="group inline-flex items-center gap-3 rounded-full btn-shimmer-amber px-10 py-5
						text-lg font-semibold text-[var(--navy)] shadow-lg shadow-amber-500/20
						hover:shadow-amber-500/40 transition-shadow"
				>
					Go to App
					<svg class="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</a>
			{:else}
				<a
					href="/auth/register"
					class="group inline-flex items-center gap-3 rounded-full btn-shimmer-amber px-10 py-5
						text-lg font-semibold text-[var(--navy)] shadow-lg shadow-amber-500/20
						hover:shadow-amber-500/40 transition-shadow"
				>
					Get Started Free
					<svg class="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</a>
			{/if}
		</div>
		<p class="reveal reveal-delay-3 mt-5 text-sm text-white/25">Free forever. No credit card needed.</p>
	</div>
</section>

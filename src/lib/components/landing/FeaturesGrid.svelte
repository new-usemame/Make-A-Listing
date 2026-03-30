<script lang="ts">
	import { onMount } from 'svelte';
	import { iconMultiPlatform, iconAiPowered, iconFreeForever, iconUpload, iconSmartContext, iconWebResearch } from './icons';

	const features = [
		{
			icon: iconMultiPlatform,
			title: 'Multi-Platform',
			description: 'Generate listings for eBay, Poshmark, Mercari, Depop, and custom platforms — all at once from a single description.',
			accent: 'var(--blue)'
		},
		{
			icon: iconAiPowered,
			title: 'AI-Powered',
			description: 'Uses top AI models through OpenRouter for accurate, keyword-rich descriptions that help your items sell faster.',
			accent: 'var(--amber)'
		},
		{
			icon: iconFreeForever,
			title: 'Free Forever',
			description: 'No subscription fees. No per-listing charges. Bring your own OpenRouter API key and only pay pennies per listing.',
			accent: '#10b981'
		},
		{
			icon: iconUpload,
			title: 'Photos & PDFs',
			description: 'Upload product images and PDF documents. AI analyzes them to create richer, more detailed listings automatically.',
			accent: '#8b5cf6'
		},
		{
			icon: iconSmartContext,
			title: 'Smart Context',
			description: 'Set your formatting rules once with a system prompt. Your listing style is remembered — never lost between sessions.',
			accent: '#ec4899'
		},
		{
			icon: iconWebResearch,
			title: 'Web Research',
			description: 'AI searches the web to find accurate specs, retail prices, and product details so your listings are always on point.',
			accent: '#06b6d4'
		}
	];

	let section: HTMLElement;
	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
			{ threshold: 0.1 }
		);
		section.querySelectorAll('.reveal').forEach(el => observer.observe(el));
		return () => observer.disconnect();
	});
</script>

<section bind:this={section} class="relative py-24 sm:py-32" style="background: var(--navy);">
	<div class="absolute inset-0 grain"></div>

	<div class="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
		<div class="text-center">
			<p class="reveal text-sm font-semibold uppercase tracking-[0.2em] text-[var(--blue-light)] mb-4">Features</p>
			<h2 class="reveal reveal-delay-1 font-serif text-3xl sm:text-4xl lg:text-5xl text-white">
				Everything You Need to <span class="italic" style="color: var(--amber);">List Faster</span>
			</h2>
			<p class="reveal reveal-delay-2 mt-5 text-lg text-white/40 max-w-2xl mx-auto">
				Powerful features that save you hours on every listing.
			</p>
		</div>

		<div class="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
			{#each features as feature, i}
				<div class="reveal reveal-delay-{Math.min(i + 1, 3)} feature-card group rounded-2xl p-7 sm:p-8
					border border-white/[0.06] hover:border-white/[0.12]"
					style="background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);"
				>
					<div class="flex h-11 w-11 items-center justify-center rounded-xl"
						style="background: {feature.accent}15; color: {feature.accent};">
						<span class="h-5 w-5">{@html feature.icon}</span>
					</div>
					<h3 class="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
					<p class="mt-2.5 text-[15px] leading-relaxed text-white/40 group-hover:text-white/55 transition-colors">
						{feature.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>

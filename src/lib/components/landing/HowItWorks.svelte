<script lang="ts">
	import { onMount } from 'svelte';

	const steps = [
		{
			num: '01',
			title: 'Describe',
			subtitle: 'Your Product',
			description: 'Add photos, upload PDFs, and describe your item in your own words. The more detail, the better your listings.',
			image: '/landing/step-describe.webp',
			alt: 'Person describing a product with photos and text'
		},
		{
			num: '02',
			title: 'Generate',
			subtitle: 'With AI',
			description: "AI creates optimized, keyword-rich listings tailored to each platform's style, character limits, and best practices.",
			image: '/landing/step-generate.webp',
			alt: 'AI transforming product description into formatted listings'
		},
		{
			num: '03',
			title: 'Copy',
			subtitle: '& List',
			description: 'Copy your ready-to-post listings and publish directly to eBay, Poshmark, Mercari, or Depop. Done in seconds.',
			image: '/landing/step-copy.webp',
			alt: 'Multiple platform listings ready to publish with checkmarks'
		}
	];

	let section: HTMLElement;
	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
			{ threshold: 0.15 }
		);
		section.querySelectorAll('.reveal').forEach(el => observer.observe(el));
		return () => observer.disconnect();
	});
</script>

<section bind:this={section} class="relative py-24 sm:py-32 bg-white overflow-hidden">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<div class="text-center">
			<p class="reveal text-sm font-semibold uppercase tracking-[0.2em] text-[var(--blue)] mb-4">How It Works</p>
			<h2 class="reveal reveal-delay-1 font-serif text-3xl sm:text-4xl lg:text-5xl text-[var(--navy)]">
				Three Steps to <span class="italic" style="color: var(--amber);">Perfect</span> Listings
			</h2>
		</div>

		<div class="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
			{#each steps as step, i}
				<div class="reveal reveal-delay-{i + 1} group text-center">
					<!-- Step number -->
					<div class="inline-flex items-center justify-center">
						<span class="font-serif text-6xl sm:text-7xl italic text-[var(--blue)]/10 group-hover:text-[var(--blue)]/20 transition-colors">
							{step.num}
						</span>
					</div>

					<!-- Image -->
					<div class="mt-4 overflow-hidden rounded-2xl border border-gray-100 shadow-sm
						group-hover:shadow-xl group-hover:border-[var(--blue)]/20 transition-all duration-500">
						<img
							src={step.image}
							alt={step.alt}
							class="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700"
							loading="lazy"
						/>
					</div>

					<!-- Text -->
					<h3 class="mt-6 font-serif text-2xl text-[var(--navy)]">
						{step.title} <span class="italic text-[var(--navy)]/50">{step.subtitle}</span>
					</h3>
					<p class="mt-3 text-[var(--navy)]/50 leading-relaxed text-[15px]">
						{step.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>

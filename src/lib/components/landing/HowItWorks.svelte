<script lang="ts">
	import { iconStep1, iconStep2, iconStep3 } from './icons';

	const steps = [
		{
			icon: iconStep1,
			title: 'Describe Your Product',
			description:
				'Add photos, upload PDFs, and describe your item in your own words. The more detail, the better your listings.',
			image: '/landing/step-describe.webp',
			alt: 'Person describing a product with photos and text'
		},
		{
			icon: iconStep2,
			title: 'AI Generates Listings',
			description:
				"Our AI creates optimized, keyword-rich listings tailored to each platform's style, character limits, and best practices.",
			image: '/landing/step-generate.webp',
			alt: 'AI transforming product description into formatted listings'
		},
		{
			icon: iconStep3,
			title: 'Copy & List',
			description:
				'Copy your ready-to-post listings and publish directly to eBay, Poshmark, Mercari, or Depop. Done in seconds.',
			image: '/landing/step-copy.webp',
			alt: 'Multiple platform listings ready to publish with checkmarks'
		}
	];
</script>

<section class="bg-white py-16 sm:py-24">
	<div class="mx-auto max-w-6xl px-4 sm:px-6">
		<h2 class="text-center text-3xl font-bold text-gray-900 sm:text-4xl">How It Works</h2>
		<p class="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600">
			Three simple steps to create professional listings for every platform.
		</p>

		<div class="mt-12 grid grid-cols-1 gap-8 sm:mt-16 sm:gap-12 md:grid-cols-3">
			{#each steps as step}
				<div class="text-center">
					<div class="mx-auto h-12 w-12">
						{@html step.icon}
					</div>
					<img
						src={step.image}
						alt={step.alt}
						class="mx-auto mt-6 max-w-xs rounded-xl shadow-md"
						loading="lazy"
					/>
					<h3 class="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
					<p class="mt-2 leading-relaxed text-gray-600">{step.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

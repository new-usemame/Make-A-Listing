<script lang="ts">
	import { iconMultiPlatform, iconAiPowered, iconFreeForever, iconUpload, iconSmartContext, iconWebResearch } from './icons';

	const features = [
		{
			icon: iconMultiPlatform,
			title: 'Multi-Platform',
			description: 'Generate listings for eBay, Poshmark, Mercari, Depop, and custom platforms — all at once from a single description.'
		},
		{
			icon: iconAiPowered,
			title: 'AI-Powered',
			description: 'Uses top AI models through OpenRouter for accurate, keyword-rich descriptions that help your items sell faster.'
		},
		{
			icon: iconFreeForever,
			title: 'Free Forever',
			description: 'No subscription fees. No per-listing charges. Bring your own OpenRouter API key and only pay pennies per listing.'
		},
		{
			icon: iconUpload,
			title: 'Photos & PDFs',
			description: 'Upload product images and PDF documents. AI analyzes them to create richer, more detailed listings automatically.'
		},
		{
			icon: iconSmartContext,
			title: 'Smart Context',
			description: 'Set your formatting rules once with a system prompt. Your listing style is remembered — never lost between sessions.'
		},
		{
			icon: iconWebResearch,
			title: 'Web Research',
			description: 'AI searches the web to find accurate specs, retail prices, and product details so your listings are always on point.'
		}
	];
</script>

<section class="bg-gray-50 py-16 sm:py-24">
	<div class="max-w-6xl mx-auto px-4 sm:px-6">
		<h2 class="text-3xl sm:text-4xl font-bold text-gray-900 text-center">Everything You Need to List Faster</h2>
		<p class="mt-4 text-lg text-gray-600 text-center max-w-2xl mx-auto">Powerful features that save you hours on every listing.</p>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
			{#each features as feature}
				<div class="bg-white rounded-xl p-6 sm:p-8 border border-gray-100 hover:shadow-lg transition-shadow">
					<div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
						<span class="w-6 h-6">{@html feature.icon}</span>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mt-4">{feature.title}</h3>
					<p class="text-gray-600 mt-2 leading-relaxed">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

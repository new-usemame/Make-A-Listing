<script lang="ts">
	import { ebayLogo, poshmarkLogo, mercariLogo, depopLogo } from './icons';
</script>

<section class="bg-gray-50 py-16 sm:py-20">
	<div class="max-w-4xl mx-auto px-4">
		<h2 class="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
			One Description. Every Platform. Perfectly Formatted.
		</h2>

		<div class="mt-10 flex items-center justify-center flex-wrap gap-6 sm:gap-8">
			<div class="w-24 sm:w-28 h-10 flex items-center justify-center">
				{@html ebayLogo}
			</div>
			<div class="w-24 sm:w-28 h-10 flex items-center justify-center">
				{@html poshmarkLogo}
			</div>
			<div class="w-24 sm:w-28 h-10 flex items-center justify-center">
				{@html mercariLogo}
			</div>
			<div class="w-24 sm:w-28 h-10 flex items-center justify-center">
				{@html depopLogo}
			</div>
			<span class="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">+ Custom</span>
		</div>

		<p class="mt-6 text-gray-500 text-center">Works with the platforms you already sell on.</p>
	</div>
</section>

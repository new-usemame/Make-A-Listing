<script lang="ts">
	let { authenticated = false }: { authenticated: boolean } = $props();
</script>

<section class="bg-gradient-to-r from-blue-600 to-blue-700 py-16 sm:py-24">
	<div class="mx-auto max-w-3xl px-4 text-center sm:px-6">
		<h2 class="text-3xl font-bold text-white sm:text-4xl">Ready to List Smarter?</h2>
		<p class="mt-4 text-lg text-blue-100">
			Join resellers who are saving hours on every listing.
		</p>
		<div class="mt-8">
			{#if authenticated}
				<a
					href="/app"
					class="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
				>
					Go to App
				</a>
			{:else}
				<a
					href="/auth/register"
					class="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
				>
					Get Started Free
				</a>
			{/if}
		</div>
		<p class="mt-4 text-sm text-blue-200">Free forever. No credit card needed.</p>
	</div>
</section>

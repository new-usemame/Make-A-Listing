<script lang="ts">
	let { authenticated = false }: { authenticated: boolean } = $props();

	let scrolled = $state(false);

	function handleScroll() {
		scrolled = window.scrollY > 50;
	}
</script>

<svelte:window onscroll={handleScroll} />

<nav
	class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {scrolled
		? 'bg-white/95 backdrop-blur shadow-sm'
		: 'bg-transparent'}"
>
	<div class="mx-auto max-w-6xl px-4 py-4 sm:px-6">
		<div class="flex items-center justify-between">
			<a href="/" class="text-xl font-bold text-blue-600">Make a Listing</a>

			<div class="flex items-center gap-4">
				{#if authenticated}
					<a
						href="/app"
						class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
					>
						Go to App
					</a>
				{:else}
					<a
						href="/auth/login"
						class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
					>
						Sign In
					</a>
					<a
						href="/auth/register"
						class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
					>
						Get Started Free
					</a>
				{/if}
			</div>
		</div>
	</div>
</nav>

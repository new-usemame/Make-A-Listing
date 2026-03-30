<script lang="ts">
	let { authenticated = false }: { authenticated: boolean } = $props();

	let scrolled = $state(false);

	function handleScroll() {
		scrolled = window.scrollY > 50;
	}
</script>

<svelte:window onscroll={handleScroll} />

<nav
	class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 {scrolled
		? 'glass border-b border-white/10 shadow-sm'
		: 'bg-transparent'}"
>
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<div class="flex h-16 items-center justify-between">
			<a href="/" class="flex items-center gap-2 group">
				<span class="font-serif text-2xl tracking-tight {scrolled ? 'text-[var(--navy)]' : 'text-white'}
					transition-colors duration-500">Make a Listing</span>
			</a>

			<div class="flex items-center gap-5">
				{#if authenticated}
					<a
						href="/app"
						class="rounded-full btn-shimmer px-6 py-2.5 text-sm font-semibold text-white
							shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
					>
						Go to App
					</a>
				{:else}
					<a
						href="/auth/login"
						class="text-sm font-medium {scrolled ? 'text-[var(--navy)]/70 hover:text-[var(--navy)]' : 'text-white/70 hover:text-white'}
							transition-colors duration-300"
					>
						Sign In
					</a>
					<a
						href="/auth/register"
						class="rounded-full btn-shimmer px-6 py-2.5 text-sm font-semibold text-white
							shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
					>
						Get Started Free
					</a>
				{/if}
			</div>
		</div>
	</div>
</nav>

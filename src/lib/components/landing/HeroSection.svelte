<script lang="ts">
	import { onMount } from 'svelte';

	let mounted = $state(false);
	onMount(() => { mounted = true; });
</script>

<section class="relative min-h-[90vh] flex items-center overflow-hidden" style="background: var(--navy);">
	<!-- Gradient mesh background -->
	<div class="absolute inset-0 hero-mesh"></div>
	<div class="absolute inset-0 grain"></div>

	<!-- Decorative floating orbs -->
	<div class="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-20"
		style="background: radial-gradient(circle, var(--blue) 0%, transparent 70%);"></div>
	<div class="absolute -bottom-48 -left-24 h-[500px] w-[500px] rounded-full opacity-10"
		style="background: radial-gradient(circle, var(--amber) 0%, transparent 70%);"></div>

	<div class="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 sm:py-32 w-full">
		<div class="flex flex-col lg:flex-row lg:items-center lg:gap-16">
			<!-- Text content -->
			<div class="lg:w-[55%]" class:mounted>
				<div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-8
					{mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-700 delay-100">
					<span class="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
					<span class="text-sm text-white/60 font-medium">Free &amp; open — bring your own API key</span>
				</div>

				<h1 class="font-serif text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] tracking-tight
					{mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700 delay-200">
					List Once.<br/>
					<span class="italic" style="color: var(--amber);">Sell Everywhere.</span>
				</h1>

				<p class="mt-7 text-lg sm:text-xl text-white/55 leading-relaxed max-w-lg
					{mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700 delay-300">
					Describe your product once. AI generates optimized, keyword-rich listings for eBay,
					Poshmark, Mercari, and Depop — tailored to each platform's rules. Completely free.
				</p>

				<div class="mt-10 flex flex-wrap items-center gap-4
					{mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700 delay-[400ms]">
					<a
						href="/auth/register"
						class="group inline-flex items-center gap-3 rounded-full btn-shimmer-amber px-8 py-4
							text-lg font-semibold text-[var(--navy)] shadow-lg shadow-amber-500/20
							hover:shadow-amber-500/40 transition-shadow"
					>
						Get Started Free
						<svg class="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
						</svg>
					</a>
					<span class="text-sm text-white/35">No credit card. No subscription.</span>
				</div>
			</div>

			<!-- Hero image -->
			<div class="mt-16 lg:mt-0 lg:w-[45%]
				{mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'} transition-all duration-1000 delay-500">
				<div class="relative">
					<!-- Glow behind image -->
					<div class="absolute -inset-4 rounded-3xl opacity-40 blur-2xl"
						style="background: linear-gradient(135deg, var(--blue) 0%, var(--amber) 100%);"></div>
					<img
						src="/landing/hero-mockup.webp?v=2"
						alt="Make a Listing app showing AI-generated product listings for eBay, Poshmark, Mercari and Depop"
						class="relative w-full rounded-2xl border border-white/10 shadow-2xl"
						loading="eager"
					/>
				</div>
			</div>
		</div>
	</div>
</section>

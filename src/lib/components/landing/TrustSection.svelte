<script lang="ts">
	import { onMount } from 'svelte';

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

<section bind:this={section} class="relative py-24 sm:py-32" style="background: var(--cream);">
	<div class="mx-auto max-w-4xl px-5 sm:px-8">
		<div class="text-center">
			<p class="reveal text-sm font-semibold uppercase tracking-[0.2em] text-[var(--blue)] mb-4">Our Story</p>
			<h2 class="reveal reveal-delay-1 font-serif text-3xl sm:text-4xl lg:text-5xl text-[var(--navy)]">
				Built by Resellers,<br class="hidden sm:block"/>
				<span class="italic" style="color: var(--amber);">for Resellers</span>
			</h2>
		</div>

		<p class="reveal reveal-delay-2 mt-8 text-center text-lg text-[var(--navy)]/50 leading-relaxed max-w-2xl mx-auto">
			We got tired of re-explaining formatting rules to ChatGPT every time we needed a listing.
			Context would get lost, character limits forgotten, keyword strategies ignored. So we built
			something better.
		</p>

		<!-- Testimonial card -->
		<div class="reveal reveal-delay-3 mt-12 relative">
			<div class="absolute -inset-1 rounded-3xl opacity-50 blur-xl"
				style="background: linear-gradient(135deg, var(--blue) 0%, var(--amber) 100%);"></div>
			<div class="relative rounded-2xl bg-white p-8 sm:p-12 shadow-sm">
				<div class="font-serif text-7xl sm:text-8xl leading-none" style="color: var(--blue); opacity: 0.15;">"</div>
				<blockquote class="-mt-8 sm:-mt-10">
					<p class="font-serif text-xl sm:text-2xl text-[var(--navy)] leading-relaxed italic">
						I used to spend 20 minutes per listing, writing the same thing differently for each
						platform. Now I describe the item once and get all my listings in under a minute.
					</p>
					<footer class="mt-6 flex items-center gap-3">
						<div class="h-px flex-1" style="background: var(--cream-dark);"></div>
						<cite class="text-sm font-medium text-[var(--navy)]/40 not-italic">
							A reseller who's done re-typing the same description four times
						</cite>
					</footer>
				</blockquote>
			</div>
		</div>
	</div>
</section>

<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	let { data, children } = $props();
</script>

<div class="min-h-screen bg-gray-50 pb-16 md:pb-0">
	<AppHeader username={data.user.username} />
	<main class="max-w-4xl mx-auto px-4 py-6">
		{@render children()}
	</main>
	<MobileNav />
</div>

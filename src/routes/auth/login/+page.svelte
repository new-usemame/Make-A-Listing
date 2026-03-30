<svelte:head>
	<title>Sign In — Make a Listing</title>
</svelte:head>

<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<a href="/" class="text-xl font-bold text-blue-600">Make a Listing</a>
			<p class="text-sm text-gray-500">Free AI listing generator for resellers</p>
		</div>

		<div class="bg-white rounded-2xl shadow-lg p-8 sm:p-10">
			<h1 class="text-2xl font-bold text-center text-gray-900 mb-6">Sign In</h1>

			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
					{form.error}
				</div>
			{/if}

			<form method="POST" use:enhance>
				<div class="mb-4">
					<label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
					<input
						type="text"
						id="username"
						name="username"
						value={form?.username ?? ''}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>

				<div class="mb-6">
					<label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>

				<button
					type="submit"
					class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
				>
					Sign In
				</button>
			</form>

			<p class="mt-4 text-center text-sm text-gray-600">
				Don't have an account?
				<a href="/auth/register" class="text-blue-600 hover:text-blue-500 font-medium">Create one</a>
			</p>
			<a href="/" class="mt-2 block text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">&larr; Back to homepage</a>
		</div>
	</div>
</div>

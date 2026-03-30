<script lang="ts">
	interface Props {
		open: boolean;
		onclose: () => void;
		onadd: (platform: { id: string; name: string; slug: string; description: string | null }) => void;
	}

	let { open, onclose, onadd }: Props = $props();

	let name = $state('');
	let description = $state('');
	let error = $state('');
	let submitting = $state(false);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}

	async function submit() {
		const trimmedName = name.trim();
		if (!trimmedName) {
			error = 'Platform name is required';
			return;
		}

		error = '';
		submitting = true;

		try {
			const res = await fetch('/api/platforms', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: trimmedName, description: description.trim() || null })
			});

			if (!res.ok) {
				const msg = await res.text();
				error = msg || 'Failed to add platform';
				return;
			}

			const platform = await res.json();
			onadd(platform);
			name = '';
			description = '';
			onclose();
		} catch {
			error = 'Something went wrong';
		} finally {
			submitting = false;
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		role="dialog"
		aria-modal="true"
		aria-label="Add a platform"
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		onkeydown={handleKeydown}
	>
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute inset-0 bg-black/40" onclick={handleBackdropClick}></div>

		<!-- Modal -->
		<div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-5 space-y-4">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-900">Add Platform</h2>
				<button
					type="button"
					onclick={onclose}
					class="text-gray-400 hover:text-gray-600 p-1"
					aria-label="Close"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Form -->
			<div class="space-y-3">
				<div>
					<label for="platform-name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
					<input
						id="platform-name"
						type="text"
						bind:value={name}
						placeholder="e.g. Facebook Marketplace"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>

				<div>
					<label for="platform-desc" class="block text-sm font-medium text-gray-700 mb-1">Description <span class="text-gray-400 font-normal">(optional)</span></label>
					<textarea
						id="platform-desc"
						bind:value={description}
						placeholder="Formatting rules, character limits, style notes..."
						rows={3}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					></textarea>
				</div>

				{#if error}
					<p class="text-sm text-red-600">{error}</p>
				{/if}
			</div>

			<!-- Actions -->
			<div class="flex justify-end gap-2 pt-1">
				<button
					type="button"
					onclick={onclose}
					class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={submit}
					disabled={submitting}
					class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
				>
					{submitting ? 'Adding...' : 'Add Platform'}
				</button>
			</div>
		</div>
	</div>
{/if}

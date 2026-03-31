<script lang="ts">
	interface Props {
		images: File[];
		pdfFile: File | null;
		onImagesChange: (files: File[]) => void;
		onPdfChange: (file: File | null) => void;
	}

	let { images, pdfFile, onImagesChange, onPdfChange }: Props = $props();

	let imageInput: HTMLInputElement;
	let pdfInput: HTMLInputElement;
	let dragging = $state(false);

	function handleImageSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files) return;
		const newFiles = Array.from(input.files);
		const combined = [...images, ...newFiles].slice(0, 5);
		onImagesChange(combined);
		input.value = '';
	}

	function handlePdfSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.[0]) return;
		onPdfChange(input.files[0]);
		input.value = '';
	}

	function removeImage(index: number) {
		onImagesChange(images.filter((_, i) => i !== index));
	}

	function removePdf() {
		onPdfChange(null);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		if (!e.dataTransfer?.files) return;

		const files = Array.from(e.dataTransfer.files);
		const imageFiles = files.filter((f) => f.type.startsWith('image/'));
		const pdf = files.find((f) => f.type === 'application/pdf');

		if (imageFiles.length > 0) {
			const combined = [...images, ...imageFiles].slice(0, 5);
			onImagesChange(combined);
		}
		if (pdf && !pdfFile) {
			onPdfChange(pdf);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragging = true;
	}

	function handleDragLeave() {
		dragging = false;
	}

	function getImagePreview(file: File): string {
		return URL.createObjectURL(file);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="rounded-lg border-2 border-dashed transition-colors p-3 {dragging
		? 'border-[var(--blue-light)] bg-blue-50'
		: 'border-[var(--cream-dark)]'}"
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
>
	<div class="flex items-center gap-2 mb-2">
		<button
			type="button"
			onclick={() => imageInput.click()}
			disabled={images.length >= 5}
			class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border bg-white hover:bg-[var(--cream)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			style="border-color: var(--cream-dark); color: var(--navy);"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
				/>
			</svg>
			Images ({images.length}/5)
		</button>

		<button
			type="button"
			onclick={() => pdfInput.click()}
			disabled={!!pdfFile}
			class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border bg-white hover:bg-[var(--cream)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			style="border-color: var(--cream-dark); color: var(--navy);"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
				/>
			</svg>
			PDF
		</button>

		<span class="text-xs hidden md:inline" style="color: var(--navy); opacity: 0.3;">or drag & drop files here</span>
	</div>

	<input
		bind:this={imageInput}
		type="file"
		accept="image/*"
		multiple
		class="hidden"
		onchange={handleImageSelect}
	/>
	<input
		bind:this={pdfInput}
		type="file"
		accept="application/pdf"
		class="hidden"
		onchange={handlePdfSelect}
	/>

	{#if images.length > 0 || pdfFile}
		<div class="flex flex-wrap gap-2 mt-2">
			{#each images as image, i (i)}
				<div class="relative group">
					<img
						src={getImagePreview(image)}
						alt="Upload preview {i + 1}"
						class="w-16 h-16 object-cover rounded-md border"
					style="border-color: var(--cream-dark);"
					/>
					<button
						type="button"
						onclick={() => removeImage(i)}
						class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
					>
						x
					</button>
				</div>
			{/each}

			{#if pdfFile}
				<div
					class="relative group flex items-center gap-2 px-3 py-2 rounded-md border"
					style="background: var(--cream); border-color: var(--cream-dark);"
				>
					<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
						/>
					</svg>
					<span class="text-sm max-w-[120px] truncate" style="color: var(--navy);">{pdfFile.name}</span>
					<button
						type="button"
						onclick={removePdf}
						class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
					>
						x
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

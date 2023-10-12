<script lang="ts">
	let inputElement: HTMLInputElement | undefined;
	let dataTransfer: DataTransfer | undefined;

	function addFilesToList(files: FileList | File[]) {
		const dt = dataTransfer ?? new DataTransfer();
		for (const file of files) {
			dt.items.add(file);
		}
		dataTransfer = dt;
		if (inputElement?.files) {
			inputElement.files = dt.files;
		}
	}

	const handleDrop = async (event: DragEvent) => {
		const files = event.dataTransfer?.files;
		if (files) {
			addFilesToList(files);
		}
	};

	const handleFileSelect = (event: Event) => {
		const files = (event.target as HTMLInputElement)?.files;
		if (files) {
			addFilesToList(files);
		}
	};
</script>

<div class="h-screen flex flex-col items-center justify-center">
	<h1 class="mb-12 text-white text-2xl">Scrub image privacy things</h1>

	<form
		class="mb-12 bg-gray-700 flex items-stretch justify-center text-white border border-gray-600 hover:bg-gray-600 active:bg-gray-500 cursor-pointer w-1/2 h-1/3"
		method="POST"
		action="/api/upload"
		enctype="multipart/form-data"
		id="form"
		on:dragover|preventDefault
		on:drop|preventDefault={handleDrop}
	>
		<button class="p-8 w-full" type="button" on:click={() => inputElement?.click()}>
			Drop files here or
			<input
				type="file"
				accept="image/*"
				multiple
				name="files"
				class="hidden"
				bind:this={inputElement}
				on:change={handleFileSelect}
			/>
			<span>Select files</span>
		</button>
	</form>

	{#if dataTransfer && dataTransfer.files.length > 0}
		<ul class="mb-12 list-disc">
			{#each dataTransfer.files as file}
				<li class="text-white my-2">{file.name}</li>
			{/each}
		</ul>
	{/if}

	<button
		type="submit"
		form="form"
		class="rounded-md bg-indigo-500 px-3.5 py-2.5 text-lg font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
		disabled={(dataTransfer?.files ?? []).length === 0}
	>
		Scrub
	</button>
</div>

<svelte:head>
	<title>Scrub image metadata</title>
</svelte:head>

<style lang="postcss">
	:global(body) {
		@apply bg-gray-800;
	}
</style>

<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
  <title>نشست</title>
  <meta name="description" content="Svelte Video Session app" />
</svelte:head>

<div class="flex flex-col h-screen overflow-y-auto">
	<main>
		{@render children()}
	</main>
</div>



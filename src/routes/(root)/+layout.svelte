<script lang="ts">
	let { children } = $props();
</script>

<div class="flex flex-col h-screen overflow-y-auto">
	<main>
		{@render children()}
	</main>

</div>



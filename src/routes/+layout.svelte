<script lang="ts">
	import Header from './Header.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<div class="flex flex-col h-screen overflow-y-auto">
	<Header />
	<main>
		{@render children()}
	</main>

</div>



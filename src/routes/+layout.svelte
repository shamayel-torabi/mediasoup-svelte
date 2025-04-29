<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<main class="h-screen overflow-y-auto">
  {@render children()}
</main>

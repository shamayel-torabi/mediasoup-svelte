<script lang="ts">
  import { setContext } from "svelte";
  import type { LayoutProps } from "./$types";
  
  let { data, children }: LayoutProps = $props();
  
  setContext('user', () => data);
</script>

{@render children()}

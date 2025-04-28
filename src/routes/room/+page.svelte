<script lang="ts">
  import type { PageProps } from "./$types";
  let { data }: PageProps = $props();
</script>

<section>
  <h1 class="text-2xl text-gray-950 dark:text-gray-50">Room</h1>
  <p class="text-gray-950 dark:text-gray-50">userName: {data.userName}</p>
  <p class="text-gray-950 dark:text-gray-50">roomId: {data.roomId}</p>
</section>

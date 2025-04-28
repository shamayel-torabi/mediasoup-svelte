<script lang="ts">
  import type { PageProps } from "./$types";
  let { data }: PageProps = $props();

  console.log('data:', data)
</script>

<section>
  <h1 class="text-2xl text-gray-950 dark:text-gray-50">Room</h1>
  <p class="text-gray-950 dark:text-gray-50">userName: {data.userName}</p>
  <p class="text-gray-950 dark:text-gray-50">roomName: {data.roomName}</p>
</section>

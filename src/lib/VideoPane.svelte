<script lang="ts">
  import { twMerge } from "tailwind-merge";
  import { onMount } from "svelte";

  let { stream, userName, videoClass, ...props }: {stream: MediaStream, userName: string; videoClass: string} = $props();

  let vidClass = twMerge(videoClass);

  let videoRef: HTMLVideoElement;

  onMount(() => {
		videoRef.srcObject = stream;
	});

</script>

<div class="m-2 truncate">
  <video bind:this={videoRef} class={vidClass} {...props}></video>
  <div class="text-center">{userName}</div>
</div>

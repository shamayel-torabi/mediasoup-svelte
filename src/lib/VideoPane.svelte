<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { twMerge } from "tailwind-merge";

  interface VideoPaneProps extends HTMLAttributes<HTMLVideoElement> {
    videoRef: HTMLVideoElement;
    userName: string;
    videoClass?: string;
    divClass?: string;
    muted?: boolean;
    autoplay?: boolean;
    playsinline?: boolean;
    controls?: boolean;
  }

  let {
    videoRef = $bindable(),
    userName,
    videoClass = "h-[9rem]",
    divClass = "m-2",
    muted = false,
    autoplay = true,
    playsinline = true,
    controls = true,
    ...props
  }: VideoPaneProps = $props();

  let vidClass = twMerge(["aspect-video mx-auto", videoClass]);
  let divcls = twMerge(["truncate bg-gray-950 dark:bg-gray-100 text-gray-50 dark:text-gray-950", divClass]);
</script>

<div class={divcls}>
  <video
    bind:this={videoRef}
    class={vidClass}
    {muted}
    {autoplay}
    {playsinline}
    {controls}
    {...props}
  ></video>
  <div class="text-center text-gray-50 dark:text-gray-950">{userName}</div>
</div>

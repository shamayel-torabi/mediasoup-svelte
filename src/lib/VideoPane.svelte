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
    videoClass = "h-[9rem] aspect-video",
    divClass = "m-2 truncate",
    muted = false,
    autoplay = false,
    playsinline = false,
    controls = false,
    ...props
  }: VideoPaneProps = $props();

  let vidClass = twMerge(videoClass);
  let divcls = twMerge(divClass);
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
  <div class="text-center">{userName}</div>
</div>

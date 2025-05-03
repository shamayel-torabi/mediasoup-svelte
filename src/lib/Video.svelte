<script>
  let { mediaStream, userName, controls = true, muted = false } = $props();
</script>

<div class="m-2 truncate">
  <video
    bind:this={mediaStream}
    class="h-[9rem] aspect-video"
    muted
    autoplay
    playsinline
    controls
  ></video>
  <div class="text-center">{userName}</div>
</div>

<script lang="ts">
  import { goto } from "$app/navigation";
  import { useSocket } from "$lib/useSocket";

  const socket = useSocket();
  let roomNameError: Boolean = false;
  let userNameError: Boolean = false;

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const frmData = new FormData(event.currentTarget as HTMLFormElement);
    const roomName = frmData.get("room") as string;
    const userName = frmData.get("username") as string;
    if (!roomName) {
      roomNameError = true;
    }
    if (!userName) {
      userNameError = true;
    }
    if (!roomName || !userName) {
      return;
    }
    const { roomId } = await socket.emitWithAck("createRoom", roomName);
    goto(`/room?roomId=${roomId}&userName=${userName}`);
  }
</script>

<svelte:head>
  <title>خانه</title>
  <meta name="description" content="Svelte Video Session app" />
</svelte:head>

<section class="overflow-y-auto">
  <article class="grid items-center justify-center h-screen">
    <div class="card w-[24rem]">
      <h5 class="card-title">پیوستن به نشست</h5>
      <form onsubmit={handleSubmit} class="max-w-sm mx-auto">
        <div class="mb-3">
          <label for="room">نام نشست</label>
          <input type="text" id="room" name="room" placeholder="Room Name" />
          {#if roomNameError}<p class="mt-3 text-red-600">
              نام نشست باید وارد شود
            </p>
          {/if}
        </div>
        <div class="mb-3">
          <label for="username">نام کاربر</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
          />
          {#if userNameError}<p class="mt-3 text-red-600">
              نام کاربر باید وارد شود
            </p>
          {/if}
        </div>
        <div class="grid justify-end">
          <button type="submit">پیوستن</button>
        </div>
      </form>
    </div>
  </article>
</section>

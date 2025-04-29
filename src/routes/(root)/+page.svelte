<script lang="ts">
  import { goto } from "$app/navigation";
  import { useSocket } from "$lib/useSocket";
  import { Button, Card, Input, Label } from "flowbite-svelte";

  const socket = useSocket();
  socket.on("connectionSuccess", (data) => {
    console.log(`Connected socketId: ${data.socketId}`);
  });

  let roomNameError: Boolean;

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const frmData = new FormData(event.currentTarget as HTMLFormElement);
    const roomName = frmData.get("room") as string;

    roomNameError = false;

    if (!roomName) {
      roomNameError = true;
      return;
    }

    const { roomId } = await socket.emitWithAck("createRoom", roomName);
    goto(`/room?roomId=${roomId}`);
  }
</script>

<svelte:head>
  <title>خانه</title>
  <meta name="description" content="Svelte Video Session app" />
</svelte:head>

<section>
  <article class="grid items-center justify-center h-screen">
    <Card class="w-sm p-2">
      <form onsubmit={handleSubmit} class="space-y-6">
        <h5 class="text-xl font-medium text-gray-900 dark:text-white">
          پیوستن به نشست
        </h5>
        <div>
          <Label for="room">نام نشست</Label>
          <Input type="text" id="room" name="room" placeholder="نام نشست" />
          {#if roomNameError}<p class="mt-3 text-red-600">
              نام نشست باید وارد شود
            </p>
          {/if}
        </div>
        <div class="grid justify-end mb-1">
          <Button type="submit">پیوستن</Button>
        </div>
      </form>
    </Card>
  </article>
</section>

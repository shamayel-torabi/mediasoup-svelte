<script lang="ts">
  import { io } from "socket.io-client";
  const socket = io("/ws");

  socket.on("connectionSuccess", (data) => {
    console.log(`Connected socketId: ${data.socketId}`);
  });
</script>

<svelte:head>
  <title>خانه</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="overflow-y-auto">
  <article class="grid items-center justify-center h-(--page--height)">
    <div class="card w-[24rem]">
      <h5 class="card-title">پیوستن به نشست</h5>
      <form id="frmJoin" class="max-w-sm mx-auto">
        <div class="mb-3">
          <label for="room">نام نشست</label>
          <input type="text" id="room" name="room" placeholder="Room Name" />
        </div>
        <div class="mb-3">
          <label for="username">نام کاربر</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
          />
        </div>
        <div class="grid justify-end">
          <button type="submit">پیوستن</button>
        </div>
      </form>
    </div>
  </article>
</section>

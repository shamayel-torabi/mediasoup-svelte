<script lang="ts">
  import type { PageProps } from "./$types";
  import { useSocket } from "$lib/useSocket";
  import { Button, Card, Input, Video } from "flowbite-svelte";
  import { Device } from "mediasoup-client";
  import requestTransportToConsume from "$lib/mediaSoupFunctions/requestTransportToConsume";
  import type {
    ConsumeData,
    ConsumerType,
  } from "$lib/mediaSoupFunctions/types";
  import { Producer, Transport } from "mediasoup-client/types";
  import createProducerTransport from "$lib/mediaSoupFunctions/createProducerTransport";
  import createProducer from "$lib/mediaSoupFunctions/createProducer";
  import { getContext } from "svelte";
  import type { Message, User } from "$lib/types";
  import MessageBox from "$lib/MessageBox.svelte";
  import { goto } from "$app/navigation";
  import { Toast } from "flowbite-svelte";
  import {
    AddressBookOutline,
    DesktopPcOutline,
    MicrophoneOutline,
    MicrophoneSlashOutline,
    UsersGroupOutline,
    VideoCameraOutline,
  } from "flowbite-svelte-icons";
  import VideoPane from "$lib/VideoPane.svelte";

  type VideoStream = "camera" | "desktop";

  let { data }: PageProps = $props();
  const context = getContext<() => { user: User }>("user");
  const user = context().user;
  const userName = `${user.firstName} ${user.lastName}`;

  let enableFeedBtn = $state(true);
  let muteBtn = $state(true);
  let pause = $state(false);
  let hangUpBtn = $state(true);
  let toastStatus = $state(false);
  let toastText: string = $state("");
  let counter = $state(6);

  let messages: Message[] = $state([]);
  let localMediaLeft: HTMLVideoElement | undefined = $state(undefined);
  let localStream: MediaStream;

  let remoteVideos: HTMLVideoElement[] = $state(new Array<HTMLVideoElement>(5));
  let remoteUserNames: string[] = $state(new Array<string>(5));

  let clientId: string;

  let device: Device;
  let producerTransport: Transport;
  let videoProducer: Producer;
  let audioProducer: Producer;

  let consumers: Record<string, ConsumerType> = {};

  const socket = useSocket();

  socket.on("connectionSuccess", (data) => {
    console.log(`Connected socketId: ${data.socketId}`);
    //console.log("rooms:", data.rooms);
  });

  socket.on("newMessage", (message) => {
    messages.push(message);
  });

  socket.on("updateActiveSpeakers", async (newListOfActives: string[]) => {
    updateRemoteVideos(newListOfActives);
  });

  socket.on("newProducersToConsume", async (consumeData) => {
    // console.log("newProducersToConsume")
    // console.log(consumeData)
    try {
      requestTransportToConsume(consumeData, socket, device, consumers, remoteVideos);
      //updateRemoteVideos(consumeData.audioPidsToCreate!);
    } catch (error) {
      console.error(error)
    }
  });

  function updateRemoteVideos(newListOfActives: string[]) {
    //console.log("updateActiveSpeakers:", newListOfActives);

    for (let el of remoteVideos) {
      el.srcObject = null; //clear out the <video>
    }

    let slot = 0;
    newListOfActives.forEach((aid) => {
      if (aid !== audioProducer?.id) {
        const consumer = consumers[aid];

        remoteVideos[slot].srcObject = consumer?.combinedStream;
        remoteUserNames[slot] = consumer?.userName;
        slot++; //for the next
      }
    });
  }
  
  function trigger(text: string) {
    toastStatus = true;
    toastText = text;
    counter = 6;
    timeout();
  }

  function timeout() {
    if (--counter > 0) return setTimeout(timeout, 1000);
    toastStatus = false;
  }

  
  async function joinRoom() {
    //console.log("joinRoom");
    const { roomId } = data;
    if (userName && roomId) {
      try {
        const joinRoomResp = await socket.emitWithAck("joinRoom", {
          userName,
          roomId,
        });

        if (joinRoomResp.error) {
          alert(joinRoomResp.error);
          trigger("خطا هنگام پیوستن به نشست!");
          goto("/");
        }

        messages = joinRoomResp.result?.messages!;
        clientId = joinRoomResp.result?.clientId!;

        device = new Device();
        await device.load({
          routerRtpCapabilities: joinRoomResp.result?.routerRtpCapabilities!,
        });

        const consumeData: ConsumeData = {
          audioPidsToCreate: joinRoomResp.result?.audioPidsToCreate!,
          videoPidsToCreate: joinRoomResp.result?.videoPidsToCreate!,
          associatedUserNames: joinRoomResp.result?.associatedUserNames!,
        };

        requestTransportToConsume(consumeData, socket, device, consumers, remoteVideos);
        //updateRemoteVideos(joinRoomResp.result?.audioPidsToCreate!);

        enableFeedBtn = false;
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function enableFeed(source: VideoStream) {
    //console.log("enableFeed");
    try {
      if (source == "camera") {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } else {
        const displayMediaOptions = {
          video: {
            cursor: "always",
            height: 1000,
            width: 1200,
          },
          audio: true,
        };
        localStream =
          await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      }
      await sendFeed();
    } catch (error) {
      trigger("خطا هنگام ارسال تصاویر ویدئویی!");
      console.log(error);
    }
  }

  async function sendFeed() {
    if (localStream && localMediaLeft) {
      localMediaLeft.srcObject = localStream;
      producerTransport = await createProducerTransport(socket, device);
      const producers = await createProducer(localStream, producerTransport);
      audioProducer = producers.audioProducer;
      videoProducer = producers.videoProducer;

      enableFeedBtn = true;
      muteBtn = false;
      hangUpBtn = false;
    }
  }

  async function muteAudio() {
    if (audioProducer.paused) {
      audioProducer.resume();
      pause = false;
      socket.emit("audioChange", "unmute");
    } else {
      audioProducer.pause();
      pause = true;
      socket.emit("audioChange", "mute");
    }
  }

  async function hangUp() {
    //console.log('hangUp');
    const { roomId } = data;
    if (roomId) {
      const result = await socket.emitWithAck("closeClient", {
        roomId,
        clientId,
      });

      if (result.status !== "success") {
        trigger("خطا هنگام خروج از نشست!");
      }

      producerTransport?.close();
      for (const [audioPid, consumer] of Object.entries(consumers)) {
        consumer?.consumerTransport?.close();
      }

      enableFeedBtn = false;
      muteBtn = true;
      hangUpBtn = true;
    }
  }

  async function sendMessage(e: SubmitEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const text = formData.get("message") as string;
    if (text) {
      socket?.emit("sendMessage", { text, userName, roomId: data.roomId! });
      (e.target as HTMLFormElement).reset();
    }
  }

  joinRoom();
</script>

<svelte:head>
  <title>نشست</title>
  <meta name="description" content="Svelte Video Session app" />
</svelte:head>

<section class="p-2 bg-gray-100 h-(--page--height)">
  <article class="grid grid-cols-[10fr_17rem] gap-1">
    <Card size="none" class="grid grid-rows-[1fr_12rem] gap-1" padding="none">
      <Card
        size="none"
        class="p-1 grid grid-rows-[1fr_2rem] items-center"
        padding="none"
      >
        <VideoPane
          bind:videoRef={remoteVideos[0]}
          userName={remoteUserNames[0]}
          videoClass="h-full"
          divClass="mb-6 mx-auto h-(--video--height)"
        />
        <div class="grid justify-center py-2">
          <div class="grid grid-cols-4 gap-2 items-center">
            <Button
              class="py-1 px-3"
              disabled={enableFeedBtn}
              onclick={() => enableFeed("camera")}
              title="ارسال تصاویر دوربین"
            >
              <VideoCameraOutline />
            </Button>
            <Button
              class="py-1 px-3"
              disabled={enableFeedBtn}
              onclick={() => enableFeed("desktop")}
              title="ارسال تصاویر صفحه نمایش"
            >
              <DesktopPcOutline />
            </Button>
            {#if pause}
              <Button
                class="py-1 px-3"
                disabled={muteBtn}
                onclick={muteAudio}
                title="صدا"
              >
                <MicrophoneOutline />
              </Button>
            {:else}
              <Button
                class="py-1 px-3"
                disabled={muteBtn}
                onclick={muteAudio}
                title="صدا"
              >
                <MicrophoneSlashOutline />
              </Button>
            {/if}
            <Button
              class="py-1 px-3"
              disabled={hangUpBtn}
              onclick={hangUp}
              title="قطع ارتباط"
            >
              <UsersGroupOutline />
            </Button>
          </div>
        </div>
      </Card>
      <Card
        size="none"
        class="grid grid-cols-5 gap-4 overflow-x-auto"
        padding="none"
      >
        <VideoPane
          bind:videoRef={localMediaLeft!}
          videoClass="w-[16rem]"
          divClass="p-2"
          {userName}
          muted
        />
        <VideoPane
          bind:videoRef={remoteVideos[1]}
          videoClass="w-[16rem]"
          divClass="p-2"
          userName={remoteUserNames[1]}
        />
        <VideoPane
          bind:videoRef={remoteVideos[2]}
          videoClass="w-[16rem]"
          divClass="p-2"
          userName={remoteUserNames[2]}
        />
        <VideoPane
          bind:videoRef={remoteVideos[3]}
          videoClass="w-[16rem]"
          divClass="p-2"
          userName={remoteUserNames[3]}
        />
        <VideoPane
          bind:videoRef={remoteVideos[4]}
          videoClass="w-[16rem]"
          divClass="p-2"
          userName={remoteUserNames[4]}
        />
      </Card>
    </Card>
    <Card size="none" padding="none">
      <div class="h-(--message--pane)">
        <ul class="h-full overflow-y-auto p-2">
          {#each messages as message}
            <MessageBox {message} />
          {/each}
        </ul>
      </div>
      <div class="m-1">
        <form onsubmit={sendMessage} class="flex">
          <Input
            name="message"
            class="rounded-none rounded-s-md"
            placeholder="پیام را وارد کنید"
          />
          <button
            aria-label="send"
            type="submit"
            class="inline-flex items-center cursor-pointer px-2 text-sm text-gray-900 bg-gray-200 border rounded-e-sm border-gray-300 border-s-0 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600"
          >
            <svg
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 rtl:rotate-180 text-gray-500 hover:text-gray-50 dark:text-gray-400"
              fill="currentColor"
            >
              <path
                d="m27.45 15.11-22-11a1 1 0 0 0 -1.08.12 1 1 0 0 0 -.33 1l2.96 10.77-3 10.74a1 1 0 0 0 1 1.26 1 1 0 0 0 .45-.11l22-11a1 1 0 0 0 0-1.78zm-20.9 10 2.21-8.11h9.24v-2h-9.24l-2.21-8.11 18.21 9.11z"
              />
              <path d="m0 0h32v32h-32z" fill="none" />
            </svg>
          </button>
        </form>
      </div>
    </Card>
  </article>
  <Toast
    position="top-left"
    bind:toastStatus
    color="primary"
    divClass="w-full max-w-xs p-4 text-white bg-red-500 shadow-sm gap-3"
  >
    <div class="flex gap-2"><AddressBookOutline /> {toastText}</div>
  </Toast>
</section>

<script lang="ts">
  import type { PageProps } from "./$types";
  import { useSocket } from "$lib/useSocket";
  import { Button, Card, Input } from "flowbite-svelte";
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

  let { data }: PageProps = $props();
  const context = getContext<() => { user: User }>("user");
  const user = context().user;
  const userName = `${user.firstName} ${user.lastName}`

  let enableFeedBtn = $state(true);
  let muteBtn = $state(true);
  let pause = $state(false);
  let hangUpBtn = $state(true);
  let messages: Message[] = $state([]);

  let device: Device;
  let producerTransport: Transport;
  let videoProducer: Producer;
  let audioProducer: Producer;

  let consumers: Record<string, ConsumerType> = {};

  let localStream: MediaStream;
  let localMediaLeft: HTMLVideoElement;

  let remoteVideos: HTMLVideoElement[] = new Array<HTMLVideoElement>(5);
  let remoteUserNames: HTMLDivElement[] = new Array<HTMLDivElement>(5);

  const socket = useSocket();

  socket.on("connectionSuccess", (data) => {
    console.log(`Connected socketId: ${data.socketId}`);
    //console.log("rooms:", data.rooms);
  });

  socket.on("newMessage", (message) => {
    messages.push(message)
  });

  socket.on("updateActiveSpeakers", async (newListOfActives: string[]) => {
    updateRemoteVideos(newListOfActives);
  });

  socket.on("newProducersToConsume", (consumeData) => {
    // console.log("newProducersToConsume")
    // console.log(consumeData)
    requestTransportToConsume(
      consumeData,
      socket,
      device,
      consumers,
      remoteVideos
    );
  });

  async function updateRemoteVideos(newListOfActives: string[]) {
    //console.log("updateActiveSpeakers:", newListOfActives);

    for (let el of remoteVideos) {
      el.srcObject = null; //clear out the <video>
    }

    let slot = 0;
    newListOfActives.forEach((aid) => {
      if (aid !== audioProducer?.id) {
        const remoteVideo = remoteVideos[slot];
        const remoteVideoUserName = remoteUserNames[slot];
        const consumerForThisSlot = consumers[aid];

        remoteVideo.srcObject = consumerForThisSlot?.combinedStream;
        remoteVideoUserName.innerHTML = consumerForThisSlot?.userName;
        slot++; //for the next
      }
    });
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
          goto('/');
        }

        messages = joinRoomResp.result?.messages!;

        device = new Device();
        await device.load({
          routerRtpCapabilities: joinRoomResp.result?.routerRtpCapabilities!,
        });

        const consumeData: ConsumeData = {
          audioPidsToCreate: joinRoomResp.result?.audioPidsToCreate!,
          videoPidsToCreate: joinRoomResp.result?.videoPidsToCreate!,
          associatedUserNames: joinRoomResp.result?.associatedUserNames!,
        };

        //console.log("consumeData:", consumeData);

        requestTransportToConsume(
          consumeData,
          socket,
          device,
          consumers,
          remoteVideos
        );

        enableFeedBtn = false;
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function enableFeed() {
    //console.log("enableFeed");
    try {
      // const displayMediaOptions = {
      //   video: {
      //     cursor: "always",
      //     height: 1000,
      //     width: 1200,
      //   },
      //   audio: true,
      // };
      // localStream =
      //   await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localStream) {
        localMediaLeft.srcObject = localStream;

        producerTransport = await createProducerTransport(socket, device);
        const producers = await createProducer(localStream, producerTransport);
        audioProducer = producers.audioProducer;
        videoProducer = producers.videoProducer;

        enableFeedBtn = true;
        muteBtn = false;
        hangUpBtn = false;
      }
    } catch (error) {
      console.log(error);
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
  }

  async function sendMessage(e: SubmitEvent) {
    e.preventDefault();
    console.log("message submit");

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const text = formData.get("message") as string;
    console.log()
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
        class="p-1 grid grid-rows-[1fr_2rem_2rem] items-center"
        padding="none"
      >
        <div class="mx-auto h-(--video--height)">
          <!-- svelte-ignore a11y_media_has_caption -->
          <video
            bind:this={remoteVideos[0]}
            class="h-full aspect-video"
            autoplay
            controls
            playsinline
          ></video>
        </div>
        <div bind:this={remoteUserNames[0]} class="text-center"></div>
        <div class="grid justify-center">
          <div>
            <Button
              class="py-1 px-3"
              disabled={enableFeedBtn}
              onclick={enableFeed}
              title="ارسال تصاویر"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-video-icon lucide-video"
              >
                <path
                  d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"
                />
                <rect x="2" y="6" width="14" height="12" rx="2" />
              </svg>
            </Button>
            {#if pause}
              <Button
                class="py-1 px-3"
                disabled={muteBtn}
                onclick={muteAudio}
                title="صدا"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-mic-off-icon lucide-mic-off"
                >
                  <line x1="2" x2="22" y1="2" y2="22" />
                  <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
                  <path d="M5 10v2a7 7 0 0 0 12 5" />
                  <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </Button>
            {:else}
              <Button
                class="py-1 px-3"
                disabled={muteBtn}
                onclick={muteAudio}
                title="صدا"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-mic-icon lucide-mic"
                >
                  <path
                    d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
                  />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </Button>
            {/if}
            <Button
              class="py-1 px-3"
              disabled={hangUpBtn}
              onclick={hangUp}
              title="قطع ارتباط"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-unplug-icon lucide-unplug"
              >
                <path d="m19 5 3-3" />
                <path d="m2 22 3-3" />
                <path
                  d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"
                />
                <path d="M7.5 13.5 10 11" />
                <path d="M10.5 16.5 13 14" />
                <path
                  d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"
                />
              </svg>
            </Button>
          </div>
        </div>
      </Card>
      <Card
        size="none"
        class="grid grid-cols-5 gap-4 overflow-x-auto"
        padding="none"
      >
        <div class="m-2 truncate">
          <video
            bind:this={localMediaLeft}
            class="h-[9rem] aspect-video"
            muted
            autoplay
            playsinline
            controls
          ></video>
          <div class="text-center">{userName}</div>
        </div>
        <div class="m-2 truncate">
          <!-- svelte-ignore a11y_media_has_caption -->
          <video
            bind:this={remoteVideos[1]}
            class="h-[9rem] aspect-video"
            autoplay
            playsinline
            controls
          ></video>
          <div
            bind:this={remoteUserNames[1]}
            class="username text-center"
          ></div>
        </div>
        <div class="m-2 truncate">
          <!-- svelte-ignore a11y_media_has_caption -->
          <video
            bind:this={remoteVideos[2]}
            class="h-[9rem] aspect-video"
            autoplay
            playsinline
            controls
          ></video>
          <div
            bind:this={remoteUserNames[2]}
            class="username text-center"
          ></div>
        </div>
        <div class="m-2 truncate">
          <!-- svelte-ignore a11y_media_has_caption -->
          <video
            bind:this={remoteVideos[3]}
            class="h-[9rem] aspect-video"
            autoplay
            playsinline
            controls
          ></video>
          <div
            bind:this={remoteUserNames[3]}
            class="username text-center"
          ></div>
        </div>
        <div class="m-2 truncate">
          <!-- svelte-ignore a11y_media_has_caption -->
          <video
            bind:this={remoteVideos[4]}
            class="h-[9rem] aspect-video"
            autoplay
            playsinline
            controls
          ></video>
          <div
            bind:this={remoteUserNames[4]}
            class="username text-center"
          ></div>
        </div>
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
      <div class="m-2">
        <form onsubmit={sendMessage} class="flex">
          <Input name="message" class="rounded-none rounded-s-md" />
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
</section>

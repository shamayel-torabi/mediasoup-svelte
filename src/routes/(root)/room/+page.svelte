<script lang="ts">
  import type { PageProps } from "./$types";
  import { useSocket } from "$lib/useSocket";
  import { Button } from "flowbite-svelte";
  import { Device } from "mediasoup-client";
  import requestTransportToConsume from "$lib/mediaSoupFunctions/requestTransportToConsume";
  import type {
    ConsumeData,
    ConsumerType,
  } from "$lib/mediaSoupFunctions/types";

  let { data }: PageProps = $props();

  const socket = useSocket();
  let enableFeedBtn = $state(true);

  let device: Device;
  let consumers: Record<string, ConsumerType> = $state({});

  let localStream: MediaStream | null = $state(null);
  let localMediaLeft: HTMLVideoElement;

  let remoteMediaMain: HTMLVideoElement;
  let remoteMediaUserName:string = $state('')

  socket.on("updateActiveSpeakers", async (newListOfActives: string[]) => {
    // console.log("updateActiveSpeakers")
    // console.log(newListOfActives)
    // an array of the most recent 5 dominant speakers. Just grab the 1st
    // and put it in the slot. Move everything else down
    // consumers is an {} with key of audioId, value of combined feed
    console.log("updateActiveSpeakers:", newListOfActives);
    const aid = newListOfActives[0];
    const consumerForThisSlot = consumers[aid];
    remoteMediaMain.srcObject = consumerForThisSlot?.combinedStream;
    remoteMediaUserName = consumerForThisSlot?.userName;
  });

  
  async function joinRoom() {
    //console.log("joinRoom");
    const { roomId, userName } = data;
    if (userName && roomId) {
      const joinRoomResp = await socket.emitWithAck("joinRoom", {
        userName,
        roomId,
      });

      if (joinRoomResp.error) {
        alert(joinRoomResp.error);
        return;
      }

      try {
        device = new Device();
        await device.load({
          routerRtpCapabilities: joinRoomResp.result?.routerRtpCapabilities!,
        });

        const consumeData: ConsumeData = {
          audioPidsToCreate: joinRoomResp.result?.audioPidsToCreate!,
          videoPidsToCreate: joinRoomResp.result?.videoPidsToCreate!,
          associatedUserNames: joinRoomResp.result?.associatedUserNames!,
        };

        console.log('consumeData:', consumeData)

        requestTransportToConsume(consumeData, socket, device, consumers);

        enableFeedBtn = false;
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function enableFeed() {
    console.log("enableFeed");
    try {
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

      // localStream = await navigator.mediaDevices.getUserMedia({
      //   video: true,
      //   audio: true,
      // });

      if (localStream) {
        localMediaLeft.srcObject = localStream;
        enableFeedBtn = true;
      }
    } catch (error) {
      console.log(error);
    }
  }

  joinRoom();
</script>

<svelte:head>
  <title>نشست</title>
  <meta name="description" content="Svelte Video Session app" />
</svelte:head>

<section class="p-2 max-w-[1200px] mx-auto bg-amber-100">
  <article class="grid grid-cols-[11fr_1fr] gap-2">
    <div class="grid justify-self-start items-start w-full h-(--page--height)">
      <div id="username-0" class="h-8 text-center">{remoteMediaUserName}</div>
      <div class="mx-auto">
        <!-- svelte-ignore a11y_media_has_caption -->
        <video
          bind:this={remoteMediaMain}
          class="h-(--video--height) aspect-video"
          autoplay
          playsinline
          controls
        ></video>
      </div>
      <div class="grid justify-center">
        <div>
          <Button
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
          <Button id="send-feed" title="برقرای ارتباط" disabled>
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
              class="lucide lucide-plug-zap-icon lucide-plug-zap"
            >
              <path
                d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"
              />
              <path d="m2 22 3-3" />
              <path d="M7.5 13.5 10 11" />
              <path d="M10.5 16.5 13 14" />
              <path d="m18 3-4 4h6l-4 4" />
            </svg>
          </Button>
          <Button id="mute" title="صدا" disabled>
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
          <Button id="hang-up" title="قطع ارتباط" disabled>
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
    </div>
    <div
      id="remote-media"
      class="grid justify-self-start items-start gap-2 overflow-y-auto"
    >
      <div id="local-media">
        <video
          bind:this={localMediaLeft}
          class="border"
          muted
          autoplay
          playsinline
        ></video>
        <div class="text-center">{data.userName}</div>
      </div>
      <div class="border remote-speaker">
        <video
          id="remote-video-1"
          class="w-full h-full remote-video"
          autoplay
          playsinline
          controls
        ></video>
        <div id="username-1" class="username text-center"></div>
      </div>
      <div class="border" style="width: 18%; height: 80px;">
        <video
          id="remote-video-2"
          class="w-full h-full remote-video"
          autoplay
          playsinline
          controls
        ></video>
        <div id="username-2" class="username text-center"></div>
      </div>
      <div class="border" style="width: 18%; height: 80px;">
        <video
          id="remote-video-3"
          class="w-full h-full remote-video"
          autoplay
          playsinline
          controls
        ></video>
        <div id="username-3" class="username text-center"></div>
      </div>
      <div class="border" style="width: 18%; height: 80px;">
        <video
          id="remote-video-4"
          class="w-full h-full remote-video"
          autoplay
          playsinline
          controls
        ></video>
        <div id="username-4" class="username text-center"></div>
      </div>
    </div>
  </article>
</section>

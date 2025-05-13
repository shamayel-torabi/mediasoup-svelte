import createConsumer from "./createConsumer";
import createConsumerTransport from "./createConsumerTransport";
import { Device } from "mediasoup-client";
import type { ConsumeData, ConsumerType } from "./types";
import type { SocketType } from "$lib/useSocket";

const requestTransportToConsume = (
  consumeData: ConsumeData,
  socket: SocketType,
  device: Device,
  consumers: Record<string, ConsumerType>,
  remoteVideos: HTMLVideoElement[],
  remoteUserNames: string[]
) => {
  //how many transports? One for each consumer?
  // Or one that handles all consumers?
  //if we do one for every consumer, it will mean we can do
  //POSITIVE: more fine grained networking control
  //it also means if one transport is lost or unstable,
  //the others are ok.
  //NEGATIVE: But it's confusing!
  //if we have one transport and all the consumers use it,
  //POSITIVE: this makes our code much easier to manage
  //and is potentially more efficient for the server
  //NEGATIVE: we have no fine control and a single point of failure
  // This means every peer has an upstream transport and a
  // downstream one, so the server will have 2n transports open,
  // where n is the number of peers

  console.log("consumeData:", consumeData);

  consumeData.audioPidsToCreate.forEach(async (audioPid, i) => {
    try {
      const videoPid = consumeData.videoPidsToCreate[i];
      // expecting back transport params for THIS audioPid. Maybe 5 times, maybe 0
      const consumerTransportParams = await socket.emitWithAck(
        "requestTransport",
        { type: "consumer", audioPid }
      );

      if (!consumerTransportParams)
        throw new Error("consumerTransportParams undefined");

      //console.log("consumerTransportParams:", consumerTransportParams);
      const consumerTransport = createConsumerTransport(
        consumerTransportParams,
        device,
        socket,
        audioPid
      );

      const [audioConsumer, videoConsumer] = await Promise.all([
        createConsumer(consumerTransport, audioPid, device, socket, "audio", i),
        createConsumer(consumerTransport, videoPid, device, socket, "video", i),
      ]);

      const combinedStream = new MediaStream([
        audioConsumer?.track,
        videoConsumer?.track,
      ]);

      if (remoteVideos[i]) {
        remoteVideos[i].srcObject = combinedStream;
        remoteUserNames[i] = consumeData?.associatedUserNames[i];
      }

      console.log("Hope this works...");
      consumers[audioPid] = {
        combinedStream,
        userName: consumeData.associatedUserNames[i],
        consumerTransport,
        audioConsumer,
        videoConsumer,
      };
    } catch (error) {
      console.log(error);
      //throw new Error("requestTransportToConsume error");
    }
  });
};

export default requestTransportToConsume;

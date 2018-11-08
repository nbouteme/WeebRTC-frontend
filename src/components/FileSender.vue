<template>
    <div>
      <input type=file @change="fileSelected">
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide, Watch } from "vue-property-decorator";
import { TransferArgs } from "@/views/Home.vue";
import { sendMessage, CommandType, readMessage } from "@/SignallingServer";
import { Peer } from "@/FileTransferPeer";

@Component
export default class FileSender extends Vue {
  @Prop()
  opts!: TransferArgs;

  async fileSelected(e: Event) {
    if (!e.target) return;
    let fileinput = e.target as HTMLInputElement;
    if (!fileinput.files) return;
    let file = fileinput.files[0];
    let offer = await readMessage<RTCSessionDescriptionInit>();
    console.log("offer", offer);
    await Peer.setRemoteDescription(offer);
    await Peer.setSDP(await Peer.createAnswer());
    console.log("awaiting file channel");
    let filechannel = await Peer.waitDataChannel("file");
    console.log("awaiting data channel");
    let datachannel = await Peer.waitDataChannel("data");
    console.log("sent file info");
    let mess = await filechannel.send(
      JSON.stringify({
        isEncryped: this.opts.encrypted,
        name: file.name,
        size: file.size
      })
    );
    let ack = await filechannel.read<boolean>();
    if (!ack) {
      await filechannel.send("null");
    } else {
      let remaining = file.size;
      let offset = 0;
      await datachannel.open();
      while (remaining) {
        let chunk = file.slice(offset, 65535);
        offset += chunk.size;
        remaining -= chunk.size;
        let buff = await new Response(chunk).arrayBuffer();
        await datachannel.send(buff);
      }
    }
    this.$emit("transferFinished", ack);
  }
}
</script>

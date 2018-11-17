<template>
    <div>
      {{$t("message." + status)}}
      <div v-if="!transfered">
        <InputFile @change="fileSelected"/>
      </div>
      <div v-else>
        {{sizestr(transfered)}} / {{sizestr(fileInfo.size)}} ({{sizestr(sc.speed)}}/s)
        <ProgressBar :value="transfered" :max="fileInfo.size"/>
      </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { readMessage } from "@/SignallingServer";
import { Peer } from "@/FileTransferPeer";
import { codecBuffer, SpeedCounter, sizestr } from "@/utils";
import { messages } from '@/localization';
import { FileInfo } from '@/views/Transfer.vue';

import InputFile from "@/components/InputFile.vue";
import ProgressBar from "@/components/ProgressBar.vue";

@Component({
  components: { InputFile, ProgressBar }
})
export default class FileSender extends Vue {
  @Prop()
  opts!: TransferArgs;

  transfered: number = 0;
  sc = new SpeedCounter();
  sizestr = sizestr;
  status: keyof typeof messages['en']['message'] = "fileselect";

  fileInfo: { name: string; size: number } | {} = {};

  async fileSelected(fileinput: HTMLInputElement) {
    this.$emit("selection", fileinput.files);
    if (!fileinput.files || fileinput.files.length === 0) return;
    let file = fileinput.files[0];
    this.fileInfo = { name: file.name, size: file.size };
    this.status = "waiting";
    if (!Peer.connected) {
      await Peer.setRemoteDescription(
        await readMessage<RTCSessionDescriptionInit>()
      );
      await Peer.setSDP(await Peer.createAnswer());
      await Peer.connect();
    };
    this.status = 'sendingmeta';
    let filechannel = await Peer.waitDataChannel("file");
    let datachannel = await Peer.waitDataChannel("data");
    let mess = await filechannel.send(
      JSON.stringify({
        isEncrypted: this.opts.encrypted,
        name: file.name,
        size: file.size
      } as FileInfo)
    );
    this.status = "waitingack";
    let ack = await filechannel.read<boolean>();
    if (!ack) {
      this.status = "filerefused";
      await filechannel.send("null");
    } else {
      this.status = "transfering";
      let remaining = file.size;
      let offset = 0;
      await datachannel.open();
      try {
        while (remaining > 0) {
          let chunk = file.slice(this.transfered, this.transfered + 65535);
          this.transfered += chunk.size;
          remaining -= chunk.size;
          let buff = await new Response(chunk).arrayBuffer();
          if (this.opts.encrypted)
            buff = await codecBuffer(buff, this.opts.key!, "encrypt");
          await datachannel.send(buff);
          this.sc.addMeasure(buff.byteLength);
        }
      } catch (e) {
        this.status = "error";
      }
    }
    this.$emit("transferFinished", ack);
  }
}
</script>

<style scoped>
input[type="file"] {
  height: 2em;
  border: 0.2em dotted rgb(255, 255, 255, 0.5);
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.4em;
  outline: none;
}

input[type="file"]::-mo input[type="file"]::-webkit-file-upload-button {
  color: #777;
  width: 100%;
  height: 100%;
  border: none;
  background: none;
  font-size: 2em;
  font-weight: bolder;
  outline: none;
}

label {
  cursor: pointer;
}
</style>

<template>
    <div>
      {{$t(status)}}
      <div v-if="!transfered">
        <InputFile @change="fileSelected"/>
      </div>
      <div v-else>
        {{sizestr(sc.transfered)}} / {{sizestr(fileInfo.size)}} ({{sizestr(sc.speed)}}/s)
        <ProgressBar :value="sc.transfered" :max="fileInfo.size"/>
      </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { readMessage } from "@/SignallingServer";
import { Peer } from "@/FileTransferPeer";
import { codecBuffer, SpeedCounter, sizestr } from "@/utils";
import { messages } from "@/localization";
import { FileInfo } from "@/views/Transfer.vue";

import InputFile from "@/components/InputFile.vue";
import ProgressBar from "@/components/ProgressBar.vue";

@Component({
  components: { InputFile, ProgressBar }
})
export default class FileSender extends Vue {
  @Prop()
  opts!: TransferArgs;

  transfered: number = 0;
  sc = new SpeedCounter(200);
  sizestr = sizestr;
  status: keyof typeof messages["en"] = "fileselect";

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
    }
    this.status = "sendingmeta";
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
          // Lit le fichier par bloc de 16Mb, car slice est relativement couteux.
          let bigchunk = file.slice(
            this.transfered,
            this.transfered + 0x1000000
          );
          let buff = await new Response(bigchunk).arrayBuffer();
          let bigchunkleft = buff.byteLength;
          let bigchunkOffset = 0;
          while (bigchunkleft > 0) {
            // 16k pour éviter des problèmes de compatibilité cross-browser
            let view = new Uint8Array(
              buff,
              bigchunkOffset,
              Math.min(0x10000, bigchunkleft)
            );
            this.transfered += view.byteLength;
            bigchunkOffset += view.byteLength;
            remaining -= view.byteLength;
            bigchunkleft -= view.byteLength;
            let outgoing;
            if (this.opts.encrypted)
              outgoing = await codecBuffer(view, this.opts.key!, "encrypt");
            await datachannel.send(view);
            await datachannel.flush();
            this.sc.addMeasure(view.byteLength);
          }
        }
        this.sc.refresh();
        this.transfered = 0;
        this.status = 'finished';
      } catch (e) {
        console.log(e);
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

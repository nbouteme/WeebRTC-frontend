<template>
    <div>
      {{status}}
      <div v-if="!transfered">
        <InputFile @change="fileSelected"/>
      </div>
      <div v-else>
        {{sizestr(transfered)}} / {{sizestr(fileInfo.size)}} ({{sizestr(sc.speed)}}/s)
      </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide, Watch } from "vue-property-decorator";
import { TransferArgs } from "@/views/Home.vue";
import { sendMessage, CommandType, readMessage } from "@/SignallingServer";
import { Peer } from "@/FileTransferPeer";
import { codecBuffer, SpeedCounter, sizestr } from "@/utils";
import InputFile from "@/components/InputFile.vue";

@Component({
  components: {InputFile}
})
export default class FileSender extends Vue {
  @Prop()
  opts!: TransferArgs;

  transfered: number = 0;
  sc = new SpeedCounter();
  sizestr = sizestr;
  status = "Attente de séléction de fichier...";

  fileInfo: { name: string; size: number } | {} = {};

  async fileSelected(fileinput: HTMLInputElement) {
    this.$emit('selection', fileinput.files);
    if (!fileinput.files) return;
    let file = fileinput.files[0];
    this.fileInfo = { name: file.name, size: file.size };
    this.status = "Attente de connection du pair";
    await Peer.setRemoteDescription(
      await readMessage<RTCSessionDescriptionInit>()
    );
    await Peer.setSDP(await Peer.createAnswer());
    await Peer.connect();
    this.status = "Pair connecté, envoi des informations de transfert";
    let filechannel = await Peer.waitDataChannel("file");
    let datachannel = await Peer.waitDataChannel("data");
    let mess = await filechannel.send(
      JSON.stringify({
        isEncryped: this.opts.encrypted,
        name: file.name,
        size: file.size
      })
    );
    this.status = "Pair connecté, attente d'acceptation...";
    let ack = await filechannel.read<boolean>();
    if (!ack) {
      this.status = "Le pair a refusé le fichier.";
      await filechannel.send("null");
    } else {
      this.status = "Transfert en cours....";
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
        this.status = "Une erreur est intervenue" + e.toString();
      }
    }
    this.$emit("transferFinished", ack);
  }
}
</script>

<style scoped>
input[type="file"] {
  height: 50px;
  border: 5px dotted rgb(255, 255, 255, 0.5);
  background-color: rgba(0, 0, 0, 0.05);
  padding: 10px;
  outline: none;
}

input[type="file"]::-mo

input[type="file"]::-webkit-file-upload-button {
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

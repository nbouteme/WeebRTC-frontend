<template>
<div>
  <TransferDialog @inputfile="onInputFileChange" @error="setError" :token="$route.params.tok"/>
  <div v-if="info && !transfering">
    {{$t('message.accept')}} {{info.name}} ({{sizestr(info.size)}})
      <input :v-model="key" v-if="info.isEncrypted" placeholder="00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF">
      <input type="button" value="Yes" @click="startDownload">
      <input type="button" value="No" @click="refuseFile">
  </div>
  <div v-else-if="transfering">
    {{sizestr(downloaded)}} / {{sizestr(info.size)}} ({{sizestr(sc.speed)}}/s)
  </div>
  <div v-else>
    {{$t('message.waitingtransfer')}}
  </div>
  <div v-if="error">{{error}}</div>
</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import TransferDialog from "@/components/TransferDialog.vue";
import { sizestr, codecBuffer, SpeedCounter } from "@/utils";

import {
  sendMessage,
  info,
  CommandType,
  readMessage
} from "@/SignallingServer";
import { Peer } from "@/FileTransferPeer";

export interface FileInfo {
  isEncrypted: boolean;
  name: string;
  size: number;
}

@Component({
  components: { TransferDialog }
})
export default class Transfer extends Vue {
  info?: FileInfo | null = null;
  transfering: boolean = false;
  key: string = "";
  downloaded: number = 0;
  sc = new SpeedCounter();
  sizestr = sizestr;
  error: string = "";

  created() {
    info.token = this.$route.params.tok;
  }

  onInputFileChange(data: FileInfo) {
    if (this.transfering) return;
    this.info = data;
  }

  async startDownload() {
    if (!this.info) return;
    let filechannel = await Peer.waitDataChannel("file");
    filechannel.send("true");
    let datachannel = await Peer.waitDataChannel("data");
    this.downloaded = 0;
    this.transfering = true;
    let fileblob = new Blob([], { type: "application/octet-stream" });
    /*
      Chrome stocke les petits blobs dans la mémoire et les gros (~2GB en
      moyenne) sont stockés sur disque. Donc plutot que de télécharger tout les
      petits blobs, puis les fusionner, puis les décrypter, ils seront décrypté
      puis cumulé dans un blob qui grossira pour éventuellement être écrit sur
      disque. Cette méthode peut être plus lente mais permet de transférer des
      fichiers plus gros. Optimisation possible: Cumuler dans un blob tampon de
      16Mo avant de concaténer au blob fileblob, pour éviter les accès disque 
      trop fréquents dans l'éventualité où le blob est stocké sur disque
    */
    try {
      while (this.downloaded < this.info.size) {
        let blob = await datachannel.read<ArrayBuffer>(e => e.data);
        if (this.info.isEncrypted)
          blob = await codecBuffer(blob, this.key, "decrypt");
        this.downloaded += blob.byteLength;
        this.sc.addMeasure(blob.byteLength);
        // this.$emit("progress", this.remaining);
        // Peut-être une meilleur manière de faire qui évite la réallocation
        fileblob = new Blob([fileblob, blob], {
          type: "application/octet-stream"
        });
      }
      let url = URL.createObjectURL(fileblob);
      let a = document.createElement("a");
      a.href = url;
      a.download = this.info.name;
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      this.setError(e);
      //this.$emit('error', e);
    }
  }

  setError(e: string) {
    this.error = e;
  }

  async refuseFile() {
    let filedatachannel = await Peer.waitDataChannel("file");
    filedatachannel.send("false");
    this.info = undefined;
  }
}
</script>

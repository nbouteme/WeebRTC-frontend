<template>
<div>
  <TransferDialog @inputfile="onInputFileChange" :token="$route.params.tok"/>
  <div v-if="info">
    Accept? {{info.name}} ({{info.size}})
      <input :v-model="key" v-if="info.isEncrypted" placeholder="00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF">
      <input type="button" value="Yes" @click="startDownload">
      <input type="button" value="No" @click="refuseFile">
  </div>
  <div v-else>
    En attente...
  </div>
</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import TransferDialog from "@/components/TransferDialog.vue";

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

  created() {
    info.token = this.$route.params.tok;
  }

  onInputFileChange(data: FileInfo) {
    if (this.transfering) return;
    this.info = data;
  }

  async decryptBuffer(buff: ArrayBuffer) {
    let keybuf = new Uint8Array(
      [...Array(32)].map((e, i) =>
        parseInt(this.key.slice(i * 2, i * 2 + 2), 16)
      )
    );

    let key = await crypto.subtle.importKey(
      "raw",
      keybuf,
      {
        name: "AES-CBC",
        length: 256
      },
      true,
      ["decrypt"]
    );
    return crypto.subtle.decrypt("AES-CBC", key, buff);
  }

  async startDownload() {
    if (!this.info) return;
    let filechannel = await Peer.waitDataChannel("file");
    filechannel.send("true");
    let datachannel = await Peer.waitDataChannel("data");
    let remaining = this.info.size;
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
    while (remaining > 0) {
      let blob = await datachannel.read<ArrayBuffer>(e => e.data);
      if (this.info.isEncrypted) blob = await this.decryptBuffer(blob);
      remaining -= blob.byteLength;
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
  }

  async refuseFile() {
    let filedatachannel = await Peer.waitDataChannel("file");
    filedatachannel.send("false");
    this.info = undefined;
  }
}
</script>

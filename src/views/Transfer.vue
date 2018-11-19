<template>
<div>
  <TransferDialog @inputfile="onInputFileChange" @error="setError" :token="$route.params.tok"/>
  <div v-if="info && !transfering">
    {{$t('accept')}} {{info.name}} ({{sizestr(info.size)}})
      <input v-model="key" v-show="info.isEncrypted" placeholder="00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF">
      <input :disabled="info.isEncrypted && !validEnc(key)" type="button" value="Yes" @click="startDownload">
      <input type="button" value="No" @click="refuseFile">
  </div>
  <div v-else-if="transfering">
    {{sizestr(sc.transfered)}} / {{sizestr(info.size)}} ({{sizestr(sc.speed)}}/s)
    <ProgressBar :value="sc.transfered" :max="info.size"/>
  </div>
  <div v-else>
    {{$t('waitingtransfer')}}
  </div>
  <div v-if="error">{{error}}</div>
</div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import {
  sizestr,
  codecBuffer,
  SpeedCounter,
  validEnc,
  saveBlobAsFile
} from "@/utils";

import { info, sendMessage } from "@/SignallingServer";
import { Peer } from "@/FileTransferPeer";

import TransferDialog from "@/components/TransferDialog.vue";
import ProgressBar from "@/components/ProgressBar.vue";

export interface FileInfo {
  isEncrypted: boolean;
  name: string;
  size: number;
}

@Component({
  components: { TransferDialog, ProgressBar }
})
export default class Transfer extends Vue {
  info?: FileInfo | null = null;
  transfering: boolean = false;
  key: string = "";
  downloaded: number = 0;
  sc = new SpeedCounter(200);
  sizestr = sizestr;
  error: string = "";
  validEnc = validEnc;

  created() {
    info.token = this.$route.params.tok;
  }

  onInputFileChange(data: FileInfo) {
    if (this.transfering) return;
    this.info = data;
    console.log(data);
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
      fichiers plus gros. Optimisation: Cumuler dans un blob tampon de
      16Mo avant de concaténer au blob fileblob, pour éviter les accès disque 
      trop fréquents dans l'éventualité où le blob est stocké sur disque
    */
    try {
      let pool: ArrayBuffer[] = [];
      // on ne fait pas pool.length = 256 pour que V8
      // puisse optimiser les accès mémoire
      // tel que décrit ici
      // https://www.youtube.com/watch?v=m9cTaYI95Zc
      const maxlen = 256;
      let allocated = false;
      let pid = 0;
      while (this.downloaded < this.info.size) {
        let blob = await datachannel.read<ArrayBuffer>(e => e.data);
        let v = new Uint8Array(blob);
        if (this.info.isEncrypted)
          blob = await codecBuffer(blob, this.key, "decrypt");
        this.downloaded += blob.byteLength;
        this.sc.addMeasure(blob.byteLength);
        if (pid == maxlen) {
          pid = 0;
          // Toute cette gymnastique est surtout pour optimiser cette opération
          fileblob = new Blob([fileblob, ...pool], {
            type: "application/octet-stream"
          });
        }
        if (!allocated && pool.length != maxlen) {
          pool.push(blob);
          allocated = pool.length == maxlen;
        } else if (allocated) pool[pid++] = blob;
        // pas sur de si accéder à des indices indéfinis mais séquentiels partant
        // du début du tableau garantisse les optimisations, donc dans le doute...
        // et flemme de compiler v8 en debug
      }
      // Flush les blocs restants
      if (allocated) pool.length = pid;
      fileblob = new Blob([fileblob, ...pool], {
        type: "application/octet-stream"
      });
      this.sc.refresh();
      saveBlobAsFile(this.info.name, fileblob);
      this.transfering = false;
      this.info = null;
    } catch (e) {
      console.error(e);
      this.setError(e);
    }
  }

  setError(e: string) {
    console.error(e);
    this.error = e;
  }

  async refuseFile() {
    let filedatachannel = await Peer.waitDataChannel("file");
    filedatachannel.send("false");
    this.info = undefined;
  }
}
</script>

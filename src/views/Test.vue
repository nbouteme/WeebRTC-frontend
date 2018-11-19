<template>
<div>
  <ProgressBar :value="35" :max="100"/>
</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ProgressBar from "@/components/ProgressBar.vue";
import { saveBlobAsFile, codecBuffer } from "@/utils";

@Component({ components: { ProgressBar } })
export default class Test extends Vue {
  async genKey() {
    let params: AesKeyGenParams = {
      name: "AES-CBC",
      length: 256
    };
    let key = await crypto.subtle.generateKey(params, true, ["encrypt"]);
    let bytes = await crypto.subtle.exportKey("raw", key);
    let tbytes = new Uint8Array(bytes);
    return Array.from(tbytes)
      .map(v => (v < 16 ? "0" : "") + v.toString(16))
      .join("");
  }

  async mounted() {
    let ab = new Uint8Array([...Array(10248)].map((e, i) => i));
    try {
      let k = await this.genKey();
      let v = await codecBuffer(
        ab.buffer,
        k,
        "decrypt"
      );
      console.log(v);
    } catch (e) {
      console.error(e);
    }
  }
}
</script>

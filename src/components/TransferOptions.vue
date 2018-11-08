<template>
    <div>
        <label>Use long tokens</label><input type="checkbox" v-model="opts.long">
        <label>Add AES Encryption</label><input type="checkbox" v-model="opts.encrypted">
        <div v-if="opts.encrypted">
            <label>AES256CBC Key</label>
            <input v-model="opts.key" placeholder="00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF">
            <input @click="genKey" type="button" value="Give me a random key">
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide, Watch } from "vue-property-decorator";
import { TransferArgs } from "@/views/Home.vue";

@Component
export default class TransferOption extends Vue {
  @Prop()
  opts!: TransferArgs;

  @Watch("opts", { deep: true })
  toggleTokenLength() {
    this.$emit("update", this.opts);
  }

  async genKey() {
    let params: AesKeyGenParams = {
      name: "AES-CBC",
      length: 256
    };
    let key = await crypto.subtle.generateKey(params, true, ["encrypt"]);
    let bytes = await crypto.subtle.exportKey('raw', key);
    let tbytes = new Uint8Array(bytes);
    this.opts.key = Array.from(tbytes).map(v => v.toString(16)).join('');
  }
}
</script>

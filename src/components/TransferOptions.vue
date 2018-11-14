<template>
    <div>
        <CheckBox v-model="opts.long">
          Use long tokens
        </CheckBox>
        <CheckBox v-model="opts.encrypted">
          Add AES Encryption
        </CheckBox>
        <div v-if="opts.encrypted">
            <input v-model="opts.key" placeholder="64 hex digits AESCBC key...">
            <input @click="genKey" type="button" value="Give me a random key">
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide, Watch } from "vue-property-decorator";
import { TransferArgs } from "@/views/Home.vue";
import CheckBox from "@/components/CheckBox.vue";

@Component({
  components: { CheckBox }
})
export default class TransferOption extends Vue {
  @Prop()
  opts!: TransferArgs;

  @Watch("opts", { deep: true })
  toggleTokenLength() {
    this.$emit("input", this.opts);
  }

  async genKey() {
    let params: AesKeyGenParams = {
      name: "AES-CBC",
      length: 256
    };
    let key = await crypto.subtle.generateKey(params, true, ["encrypt"]);
    let bytes = await crypto.subtle.exportKey("raw", key);
    let tbytes = new Uint8Array(bytes);
    this.opts.key = Array.from(tbytes)
      .map(v => (v < 16 ? '0' : '') + v.toString(16))
      .join("");
  }
}
</script>

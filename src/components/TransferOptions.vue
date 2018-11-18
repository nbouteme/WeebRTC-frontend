<template>
    <div>
        <CheckBox v-model="opts.long">
          {{$t('longtoken')}}
        </CheckBox>
        <CheckBox v-model="opts.encrypted">
          {{$t('enableaes')}}
        </CheckBox>
        <div v-if="opts.encrypted">
            <input v-model="opts.key" placeholder="64 hex digits AESCBC key...">
            <input @click="genKey" type="button" :value="$t('randkey')">
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
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
      .map(v => (v < 16 ? "0" : "") + v.toString(16))
      .join("");
  }
}
</script>

<style scoped>
div {
  text-align: left;
}
</style>

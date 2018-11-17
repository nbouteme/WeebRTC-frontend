<template>
  <CopyableText  v-if="opts.encrypted">
    <label slot="name">{{$t('message.key')}}</label>
    <span slot="hidden"></span>
    <label slot="content">{{opts.key}}</label>
  </CopyableText>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import CopyableText from "@/components/CopyableText.vue";

@Component({
  components: { CopyableText }
})
export default class TokenDisplay extends Vue {
  @Prop()
  opts!: TransferArgs;
}
</script>

<style scoped>
</style>

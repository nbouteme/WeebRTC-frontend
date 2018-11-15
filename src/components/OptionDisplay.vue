<template>
  <CopyableText  v-if="opts.encrypted">
    <label slot="name">{{$t('message.key')}}</label>
    <span slot="hidden"></span>
    <label slot="content">{{opts.key}}</label>
  </CopyableText>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import {
  readMessage,
  sendMessage,
  closeConnection,
  CommandType,
  info,
  connectionOpened
} from "../SignallingServer";
import { FileInfo } from '@/views/Transfer.vue';
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

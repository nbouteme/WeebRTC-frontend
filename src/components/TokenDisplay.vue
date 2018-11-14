<template>
  <CopyableText>
    <label slot="name">{{$t('message.token')}}</label>
    <span slot="hidden">{{myorigin}}/</span>
    <router-link slot="content" :to="token">{{token}}</router-link>
  </CopyableText>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { TransferArgs } from "@/views/Home.vue";
import {
  readMessage,
  sendMessage,
  closeConnection,
  CommandType,
  info,
  connectionOpened
} from "../SignallingServer";
import CopyableText from "@/components/CopyableText.vue";

@Component({
  components: { CopyableText }
})
export default class TokenDisplay extends Vue {
  @Prop()
  long!: boolean;

  token?: string = "";
  myorigin: string = "";

  @Watch("long")
  async refreshToken() {
    await sendMessage(JSON.stringify([CommandType.RequestToken, this.long]));
    info.token = await readMessage<typeof info["token"]>();
    this.token = info.token;
    console.log(this.token);
  }

  async mounted() {
    this.myorigin = location.origin;
    await this.refreshToken();
  }
}
</script>

<style scoped>
</style>

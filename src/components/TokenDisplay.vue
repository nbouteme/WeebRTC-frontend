<template>
  <CopyableText>
    <label slot="name">{{$t('token')}}</label>
    <span slot="hidden">{{myorigin}}/{{token}}</span>
    <router-link slot="content" :to="token">{{token}}</router-link>
  </CopyableText>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import {
  readMessage,
  sendMessage,
  CommandType,
  info
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
  }

  async mounted() {
    this.myorigin = location.origin;
    this.token = this.$t("gentoken").toString();
    await this.refreshToken();
  }
}
</script>

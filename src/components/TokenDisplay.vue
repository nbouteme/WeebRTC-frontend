<template>
  <router-link :to="token">{{token}}</router-link>
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide, Watch } from "vue-property-decorator";
import { TransferArgs } from "@/views/Home.vue";
import {
  readMessage,
  sendMessage,
  closeConnection,
  CommandType,
  info,
  connectionOpened
} from "../SignallingServer";

@Component
export default class TokenDisplay extends Vue {
  @Prop()
  long!: boolean;

  token?: string = "";

  @Watch("long")
  async refreshToken() {
    await sendMessage(JSON.stringify([CommandType.RequestToken, this.long]));
    info.token = await readMessage<typeof info['token']>();
    this.token = `/${info.token}`;
  }

  async mounted() {
    await this.refreshToken();
  }
}
</script>

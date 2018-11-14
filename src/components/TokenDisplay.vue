<template>
  <div>
    <a ref="link">{{myorigin}}/</a>
    <router-link :to="token">{{token}}</router-link>
    <button ref="copy">Copy</button>
  </div>
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

@Component
export default class TokenDisplay extends Vue {
  @Prop()
  long!: boolean;

  token?: string = "";
  myorigin: string = '';

  @Watch("long")
  async refreshToken() {
    await sendMessage(JSON.stringify([CommandType.RequestToken, this.long]));
    info.token = await readMessage<typeof info['token']>();
    this.token = info.token;
  }

  async mounted() {
    this.myorigin = location.origin;
    let copy = this.$refs.copy as HTMLButtonElement;    
    copy.onclick = e => {
      let sel = document.getSelection();
      if (!sel) {
        return;
      }
      let link = this.$refs.link as HTMLLinkElement;
      let range = document.createRange();
      range.setStart(link, 0);
      range.setEnd(copy, 0);
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('copy');
      sel.removeAllRanges();
    };
    await this.refreshToken();
  }
}
</script>

<style scoped>
a {
  text-decoration: none;
  color: green;
  border: 1px solid green;
  padding: 5px;
  border-radius: 7px;
  border-bottom-right-radius: 0px;
  border-top-right-radius: 0px;
  background-color: rgba(255, 255, 255, 0.3);
  font-size: 1em;
}

div > a:first-child {
  position: absolute;
  opacity: 0;
  z-index: -1;
}

button {
  border: 1px solid green;
  background-color: lightgreen;
  color: green;
  padding: 5px;
  font-size: 1em;
  border-left: none;
  border-bottom-right-radius: 7px;
  border-top-right-radius: 7px;
}
</style>

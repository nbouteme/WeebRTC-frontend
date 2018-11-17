<template>
  <div class="root">
    <slot name="name"></slot>
    <slot ref="begin" name="hidden"></slot>
    <slot name="content"></slot>
    <label class="button" ref="copy">{{$t('message.copy')}}</label>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class TokenDisplay extends Vue {
  @Prop()
  hidden!: string;

  async mounted() {
    let copy = this.$refs.copy as HTMLButtonElement;
    copy.onclick = e => {
      let sel = document.getSelection();
      if (!sel) return;
      let begin = this.$vnode!.elm!.childNodes[1] as HTMLLinkElement;
      let range = document.createRange();
      range.setStart(begin, 0);
      range.setEnd(copy, 0);
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand("copy");
      sel.removeAllRanges();
    };
  }
}
</script>

<style scoped>
.root {
  display: inline-grid;
  grid-template-columns: min-content minmax(0, 100vw) min-content;
  text-align: center;
  margin: 0.2em 0 0.2em 0;
}

.root > * {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.root > *:nth-child(1) {
  border: 1px solid green;
  padding: 0.2em;
  border-top-left-radius: 0.25em;
  border-bottom-left-radius: 0.25em;
  background-color: #38ed38;
  color: white;
}

.root > *:nth-child(2) {
  position: absolute;
  opacity: 0;
  z-index: -1;
}

.root > *:nth-child(3) {
  text-decoration: none;
  color: green;
  border: 1px solid green;
  padding: 0.2em;
  border-left: none;
  background-color: rgba(255, 255, 255, 0.3);
  font-size: 1em;
}

.button {
  border: 1px solid green;
  background-color: lightgreen;
  color: green;
  padding: 0.2em;
  outline: none;
  font-size: 1em;
  border-left: none;
  border-bottom-right-radius: 0.25em;
  border-top-right-radius: 0.25em;
}
</style>

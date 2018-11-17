<template>
<div ref="root">
    <label><slot></slot></label>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class CheckBox extends Vue {
  @Prop()
  value!: boolean;

  mounted() {
    let root = this.$refs.root as HTMLDivElement;
    root.onclick = e => {
      console.log(this.value);
      this.$emit("input", !this.value);
      if (!this.value) root.classList.add("active");
      else root.classList.remove("active");
      console.log(this.value);
    };
    if (this.value) root.classList.add("active");
  }
}
</script>

<style scoped>
div {
  border: 0.2em dashed lightgrey;
  display: inline-block;
  margin: 0.4em;
  padding: 0.2em;
  border-radius: 0.4em;
  background-color: rgba(250, 250, 250, 0.2);
}

div:hover {
  background-color: rgba(100, 250, 100, 0.5);
}

div.active {
  border: 0.2em dashed lightgreen;
  background-color: rgba(100, 250, 100, 0.5);
}

div.active:hover {
  border: 0.2em dashed lightgrey;
}
</style>

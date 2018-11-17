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
div:last-child {
  float: right;
}

div {
  border: 0.1em dashed lightgrey;
  display: inline-block;
  margin: 0 0 1em 0;
  padding: 0.4em 0;
  border-radius: 0.4em;
  background-color: rgba(250, 250, 250, 0.2);
}

div:hover {
  background-color: rgba(100, 250, 100, 0.5);
}

div.active {
  border: 0.1em dashed lightgreen;
  background-color: rgba(100, 250, 100, 0.5);
}

div.active:hover {
  border: 0.1em dashed lightgrey;
}
</style>

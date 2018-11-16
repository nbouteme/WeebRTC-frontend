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
      this.$emit("input", !this.value);
      root.classList.toggle("active", this.value);
    };
    root.classList.toggle("active", this.value);
  }
}
</script>

<style scoped>
div {
  border: 5px dashed lightgrey;
  display: inline-block;
  margin: 10px;
  padding: 5px;
  border-radius: 10px;
  background-color: rgba(250, 250, 250, 0.2);
}

div:hover {
  background-color: rgba(100, 250, 100, 0.5);
}

div.active {
  border: 5px dashed lightgreen;
  background-color: rgba(100, 250, 100, 0.5);
}

div.active:hover {
  border: 5px dashed lightgrey;
}

</style>

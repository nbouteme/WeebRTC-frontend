<template>
  <div class="bg">
    <div class="fg" :style="calculatedWidth">
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ProgressBar extends Vue {
  @Prop()
  value!: number;

  @Prop()
  max!: number;

  get calculatedWidth() {
    return { width: `${(this.value / this.max) * 100}%` };
  }
}
</script>

<style scoped>
div {
  border-radius: 1000px;
}

.bg {
  width: 100%;
  height: 10px;
  background-color: lightgray;
  padding: 4px;
}

.fg {
  height: 100%;
  background-color: grey;
}
</style>

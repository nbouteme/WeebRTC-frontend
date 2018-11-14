<template>
<div>
    <h1>Hi there!</h1>
    <h3>Share files through WebRTC here</h3>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide, Watch } from "vue-property-decorator";

@Component
export default class Header extends Vue {}
</script>

<style scoped>
h1, h3 {
  text-align: center;
}

h1 {
  font-size: 3em;
}
</style>

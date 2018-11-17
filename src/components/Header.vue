<template>
<div>
    <h1>{{$t("message.head")}}</h1>
    <h3>{{$t("message.sub")}}</h3>
</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

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

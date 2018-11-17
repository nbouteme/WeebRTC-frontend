<template>
<div>
  <ProgressBar :value="35" :max="100"/>
</div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import ProgressBar from "@/components/ProgressBar.vue";

@Component({ components: { ProgressBar } })
export default class Test extends Vue {}
</script>

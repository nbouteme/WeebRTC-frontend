<template>
    <div></div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class NotFound extends Vue {
  created() {
    this.$router.replace('/');
  }
}
</script>

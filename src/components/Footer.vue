<template>
    <div>
        <hr>
        <a href="https://github.com/nbouteme/WeebRTC-frontend">Github</a>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Footer extends Vue {

}
</script>

<style scoped>
hr {
    border: none;
    border-bottom: 1px solid grey;
}

div {
    text-align: center;
}

a {
    text-decoration: none;
    color:green;
}

a:hover {
    color: greenyellow;
}
</style>

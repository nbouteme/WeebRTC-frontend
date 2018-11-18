<template>
  <div id="app">
    <Header/>
    <div id="content">
      <router-view v-if="!appState.offline"/>
      <p v-else>{{$t('offline')}}</p>
    </div>
    <Footer/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { appState } from '@/config';

@Component({
  components: {
    Header,
    Footer
  }
})
export default class App extends Vue {
  appState = appState;
}
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Itim");

#app {
  width: 360px;
  margin: 0 auto 0 auto;
}

@media screen and (orientation: portrait) and (max-width: 480px) {
  #app {
    width: 100%;
  }
}

body {
  background-image: url("/img/bg.png");
  margin: 40px auto;
  line-height: 1.6;
  font-size: 1.4em;
  color: #444;
  padding: 0;
  font-family: Itim;
}

#content {
  text-align: center;
  padding: 0 3px 0 3px;
}

h1,
h2,
h3 {
  line-height: 1.2;
}
</style>

import Component from 'vue-class-component';

import Vue, { PluginFunction, PluginObject } from 'vue';
import App from './App.vue';
import router from './router';
import './registerServiceWorker';

Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate'
]);

Vue.config.productionTip = false;

export let root = new Vue({
  router,
  render: h => h(App)
}).$mount('#app');

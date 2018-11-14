import Component from 'vue-class-component';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import VueI18n from 'vue-i18n'

import './registerServiceWorker';
import { messages } from './localization';

// Create VueI18n instance with options
Vue.use(VueI18n);

let locales = Object.keys(messages);
let fav = navigator.languages
            .find(e => locales.some(l => e.includes(l)));

const i18n = new VueI18n({
  locale: fav,
  fallbackLocale: 'en',
  messages
});

Vue.config.productionTip = false;

export let root = new Vue({
  i18n,
  router,
  render: h => h(App)
}).$mount('#app');

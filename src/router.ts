import Vue from 'vue';
import Router from 'vue-router';

import Home from './views/Home.vue';
import Transfer from './views/Transfer.vue';
import NotFound from './views/NotFound.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [{
      path: '/',
      name: 'home',
      component: Home
    }, {
      path: '/:tok',
      name: 'transfer',
      component: Transfer
    }, {
      path: '*',
      name: 'notfound',
      component: NotFound
    }
  ]
});

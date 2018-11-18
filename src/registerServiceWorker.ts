/* eslint-disable no-console */

import { register } from 'register-service-worker';
import { appState } from './config';

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      );
    },
    cached() {
      console.log('Content has been cached for offline use.');
    },
    updated() {
      console.log('New content is available; please refresh.');
    },
    offline() {
      appState.offline = true;
    },
    error(error) {
      console.error('Error during service worker registration:', error);
    }
  });
}

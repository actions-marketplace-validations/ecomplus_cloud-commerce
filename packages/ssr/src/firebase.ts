/* eslint-disable import/prefer-default-export */

import 'source-map-support/register.js';
// eslint-disable-next-line import/no-unresolved
import { initializeApp } from 'firebase-admin/app';
// eslint-disable-next-line import/no-unresolved
import { onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';

initializeApp();
const options = config.get().httpsFunctionOptions;

export const ssr = onRequest(options, (request, response) => {
  response.send('<h1>Hello SSR!</h1>');
});

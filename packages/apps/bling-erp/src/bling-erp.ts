/* eslint-disable import/prefer-default-export */

import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config, { createExecContext } from '@cloudcommerce/firebase/lib/config';
import { createAppEventsFunction } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import handleApiEvent from './event-to-bling';
import handleBlingCallback from './bling-callback';
import handleBlingAuthCallback from './bling-auth-callback';
import refreshBlingToken from './refresh-bling-token';

const { httpsFunctionOptions } = config.get();
const { region } = httpsFunctionOptions;

export const blingerp = {
  onStoreEvent: createAppEventsFunction(
    'blingErp',
    handleApiEvent,
    /* 60s (padrão) estoura em importação de produto com muitas imagens,
    que são baixadas e reenviadas sequencialmente à Storage API */
    { memory: '512MB', timeoutSeconds: 300 },
  ),

  callback: functions
    .region(region)
    .runWith({
      ...httpsFunctionOptions,
      memory: '512MB',
      timeoutSeconds: 120,
    })
    .https.onRequest((req, res) => {
      return createExecContext(() => handleBlingCallback(req, res));
    }),

  authCallback: functions
    .region(region)
    .runWith({
      ...httpsFunctionOptions,
      timeoutSeconds: 60,
    })
    .https.onRequest((req, res) => {
      return createExecContext(() => handleBlingAuthCallback(req, res));
    }),

  cronRefreshToken: functions
    .region(region)
    .runWith({ timeoutSeconds: 120, memory: '256MB' })
    /* Token de ~6h renovado a partir de 70min do vencimento: checagem por
    hora basta, duas por hora vinham do fan-out multi-tenant do app legado */
    .pubsub.schedule(process.env.CRONTAB_BLINGERP_REFRESH_TOKEN || '36 * * * *')
    .onRun(() => refreshBlingToken()),
};

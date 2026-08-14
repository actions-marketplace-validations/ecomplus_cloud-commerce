import type { Orders } from '@cloudcommerce/types';
import type { AnalyticsEvent } from './send-analytics-events';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import api from '@cloudcommerce/api';
import axios from 'axios';

// https://help.awin.com/apidocs/conversion-api
const {
  AWIN_ADVERTISER_ID,
  AWIN_API_KEY,
  DEBUG_SERVER_ANALYTICS,
} = process.env;
const awinAxios = AWIN_ADVERTISER_ID && AWIN_API_KEY
  ? axios.create({
    baseURL: `https://api.awin.com/s2s/advertiser/${AWIN_ADVERTISER_ID}`,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AWIN_API_KEY,
    },
  })
  : null;

// Expected AwinChannelCookie values — Awin docs mandate 'aw' as the fallback
const validChannels = new Set([
  'aw', 'ppcgeneric', 'ppcbrand', 'display', 'social', 'Other', 'Organic', 'direct',
]);

// Awin forbids the pipe character in id/name/sku/category basket fields
const stripPipes = (value: unknown) => (
  typeof value === 'string' ? value.replace(/\|/g, '') : value
);

// Customers coming back from external payment pages land on the confirmation
// route without the order number, so the purchase event may miss it
const fetchOrderFallback = async (orderId: string) => {
  if (!/^[0-9a-f]{24}$/.test(orderId)) return null;
  try {
    const { data: order } = await api.get(`orders/${orderId as Orders['_id']}`, {
      fields: ['number', 'amount', 'extra_discount'] as const,
    });
    return order;
  } catch (err: any) {
    logger.warn(`Failed reading order ${orderId} for Awin reference`, {
      status: err.statusCode || err.response?.status,
    });
    return null;
  }
};

const sendToAwin = async ({
  events,
  awc,
  channel = 'aw',
}: {
  events: AnalyticsEvent[],
  awc?: string,
  channel?: string,
}) => {
  if (!awinAxios || !awc) return;
  const purchaseEvents = events.filter((ev) => ev.name === 'purchase');
  if (!purchaseEvents.length) return;
  const awinOrders: Array<Record<string, any>> = [];
  for (let i = 0; i < purchaseEvents.length; i++) {
    const { params } = purchaseEvents[i];
    // eslint-disable-next-line no-continue
    if (!params?.transaction_id) continue;
    let orderNumber = params.order_number;
    let voucher = params.coupon;
    // Awin expects the commissionable amount without freight and taxes
    let grossValue = Number(params.value) || 0;
    let shipping = Number(params.shipping) || 0;
    let tax = Number(params.tax) || 0;
    if (!orderNumber) {
      // eslint-disable-next-line no-await-in-loop
      const order = await fetchOrderFallback(`${params.transaction_id}`);
      if (order) {
        orderNumber = order.number;
        if (order.amount) {
          grossValue = Number(order.amount.total) || grossValue;
          shipping = Number(order.amount.freight) || 0;
          tax = Number(order.amount.tax) || 0;
        }
        if (!voucher) voucher = order.extra_discount?.discount_coupon;
      }
    }
    const netAmount = Math.max(
      Math.round((grossValue - shipping - tax) * 100) / 100,
      0,
    );
    const awinOrder: Record<string, any> = {
      orderReference: String(orderNumber || params.transaction_id),
      channel: validChannels.has(channel) ? channel : 'aw',
      awc,
      voucher,
      amount: netAmount,
      currency: params.currency || config.get().currency,
      commissionGroups: [{
        code: 'DEFAULT',
        amount: netAmount,
      }],
      basket: params.items?.map((item: Record<string, any>) => ({
        id: stripPipes(item.object_id || item.item_id),
        name: stripPipes(item.item_name),
        price: item.price,
        quantity: item.quantity || 1,
        commissionGroupCode: 'DEFAULT',
        sku: stripPipes(item.item_id),
        category: stripPipes(item.item_category || item.item_brand || item.item_id),
      })),
    };
    awinOrders.push(awinOrder);
  }
  if (awinOrders.length) {
    const data = { orders: awinOrders };
    if (DEBUG_SERVER_ANALYTICS?.toLowerCase() === 'true') {
      logger.info('Awin orders', { data });
    }
    await awinAxios.post('/orders', data);
  }
};

export default sendToAwin;

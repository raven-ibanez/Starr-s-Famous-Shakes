import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsHeaders, createStops, proxyRequest } from './utils';

type DeliveryStoreConfig = {
  market: string;
  serviceType: string;
  sandbox: boolean;
  storeName: string;
  storePhone: string;
  storeAddress: string;
  storeLatitude: number;
  storeLongitude: number;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body;
  if (!body?.deliveryAddress || body.deliveryLat === undefined || body.deliveryLng === undefined) {
    return res.status(400).json({ error: 'Missing delivery details' });
  }

  const config: DeliveryStoreConfig = {
    market: body.market,
    serviceType: body.serviceType,
    sandbox: Boolean(body.sandbox),
    storeName: body.storeName,
    storePhone: body.storePhone,
    storeAddress: body.storeAddress,
    storeLatitude: Number(body.storeLatitude),
    storeLongitude: Number(body.storeLongitude)
  };

  try {
    const quotePayload = {
      data: {
        serviceType: config.serviceType,
        language: 'en_PH',
        stops: createStops(config, body.deliveryAddress, {
          lat: Number(body.deliveryLat),
          lng: Number(body.deliveryLng)
        }),
        item: {
          quantity: '1',
          weight: 'LESS_THAN_3_KG',
          categories: ['FOOD_DELIVERY'],
          handlingInstructions: ['KEEP_UPRIGHT']
        }
      }
    };

    const response = await proxyRequest('/quotations', quotePayload, config.market, config.sandbox);
    return res.json({
      quotationId: response.data?.quotationId,
      price: response.data?.priceBreakdown?.total,
      currency: response.data?.priceBreakdown?.currency,
      expiresAt: response.data?.expiresAt
    });
  } catch (error: any) {
    console.error('Quote proxy error', error);
    return res.status(500).json({ error: error.message });
  }
}

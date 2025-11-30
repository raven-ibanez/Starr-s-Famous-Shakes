import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsHeaders, proxyRequest } from './utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body;
  if (!body?.quotationId || !body?.recipientName || !body?.recipientPhone) {
    return res.status(400).json({ error: 'Missing order details' });
  }

  try {
    const orderPayload = {
      data: {
        quotationId: body.quotationId,
        sender: {
          stopId: body.senderStopId,
          name: body.storeName,
          phone: body.storePhone
        },
        recipients: [
          {
            stopId: body.recipientStopId,
            name: body.recipientName,
            phone: body.recipientPhone,
            remarks: body.recipientRemarks || ''
          }
        ],
        isPODEnabled: true,
        metadata: body.metadata || {}
      }
    };

    const response = await proxyRequest('/orders', orderPayload, body.market, Boolean(body.sandbox));
    return res.json({
      orderId: response.data?.orderId,
      status: response.data?.status,
      shareLink: response.data?.shareLink,
      driverId: response.data?.driverId
    });
  } catch (error: any) {
    console.error('Order proxy error', error);
    return res.status(500).json({ error: error.message });
  }
}

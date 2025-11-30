type DeliveryCoordinates = { lat: number; lng: number };
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

const API_BASE_URL = 'https://rest.lalamove.com/v3';
const API_SANDBOX_URL = 'https://rest.sandbox.lalamove.com/v3';

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env var ${key}`);
  }
  return value;
};

const signPayload = async (method: string, path: string, body: string) => {
  const secret = getEnv('LALAMOVE_API_SECRET');
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const message = `${new Date().toISOString()}\r\n${method}\r\n${path}\r\n\r\n${body}`;
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Buffer.from(signatureBuffer).toString('base64');
};

const proxyRequest = async (
  path: string,
  payload: Record<string, unknown>,
  market: string,
  sandbox: boolean
) => {
  const apiKey = getEnv('LALAMOVE_API_KEY');
  const signature = await signPayload('POST', path, JSON.stringify(payload));
  const upstreamUrl = `${sandbox ? API_SANDBOX_URL : API_BASE_URL}${path}`;

  const response = await fetch(upstreamUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-LLM-Market': market,
      Authorization: `hmac ${apiKey}:${signature}`
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Upstream error ${response.status}: ${text}`);
  }

  return JSON.parse(text);
};

const createStops = (
  config: DeliveryStoreConfig,
  deliveryAddress: string,
  deliveryCoordinates: DeliveryCoordinates
) => [
  {
    location: {
      lat: config.storeLatitude.toString(),
      lng: config.storeLongitude.toString()
    },
    addresses: {
      en_PH: {
        displayString: config.storeAddress,
        country: config.market
      }
    },
    contactName: config.storeName
  },
  {
    location: {
      lat: deliveryCoordinates.lat.toString(),
      lng: deliveryCoordinates.lng.toString()
    },
    addresses: {
      en_PH: {
        displayString: deliveryAddress,
        country: config.market
      }
    },
    contactName: config.storeName
  }
];

const corsHeaders = (res: { setHeader: (name: string, value: string) => void }) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export { DeliveryStoreConfig, createStops, proxyRequest, corsHeaders };

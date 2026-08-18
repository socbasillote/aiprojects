import { env } from "../config/env.js";
import { getPayPalBaseUrl } from "../config/paypal.js";

function assertConfigured() {
  if (!env.paypalClientId || !env.paypalClientSecret) {
    const error = new Error(
      "PayPal payments are not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to the server environment.",
    );

    error.status = 503;
    throw error;
  }
}

function createPayPalError(message, status, body) {
  const error = new Error(message);

  error.status = status;
  error.paypal = body;
  error.debugId = body?.debug_id || null;
  error.paypalName = body?.name || null;
  error.details = body?.details || [];

  return error;
}

async function parsePayPalResponse(response) {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createPayPalError(
      body?.message || body?.error_description || "PayPal API request failed",
      response.status,
      body,
    );
  }

  return body;
}

export async function getPayPalAccessToken() {
  assertConfigured();

  const credentials = Buffer.from(
    `${env.paypalClientId}:${env.paypalClientSecret}`,
  ).toString("base64");

  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",

    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },

    body: "grant_type=client_credentials",
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("[PayPal] OAuth authentication failed", {
      status: response.status,
      name: body?.name,
      error: body?.error,
      description: body?.error_description,
    });

    throw createPayPalError(
      body?.error_description ||
        body?.message ||
        "PayPal authentication failed",
      response.status,
      body,
    );
  }

  if (!body?.access_token) {
    throw new Error(
      "PayPal authentication succeeded but no access token was returned.",
    );
  }

  return body.access_token;
}

export async function createPayPalOrder({ packageInfo, customId }) {
  if (!packageInfo) {
    const error = new Error("PayPal package information is required.");

    error.status = 400;
    throw error;
  }

  const price = Number(packageInfo.price);

  if (!Number.isFinite(price) || price <= 0) {
    const error = new Error("PayPal package price must be a positive number.");

    error.status = 400;
    throw error;
  }

  const formattedPrice = price.toFixed(2);

  const currency = String(packageInfo.currency || "USD").toUpperCase();

  const token = await getPayPalAccessToken();

  const baseUrl = getPayPalBaseUrl();

  const requestId = crypto.randomUUID();

  const payload = {
    intent: "CAPTURE",

    purchase_units: [
      {
        custom_id: customId,
        description: String(packageInfo.name).slice(0, 127),

        amount: {
          currency_code: currency,
          value: formattedPrice,
        },
      },
    ],

    application_context: {
      shipping_preference: "NO_SHIPPING",

      user_action: "PAY_NOW",
    },
  };

  console.log("[PayPal] Create order request", {
    environment: env.paypalEnvironment,

    endpoint: `${baseUrl}/v2/checkout/orders`,

    requestId,

    packageId: packageInfo.id,

    amount: formattedPrice,

    currency,

    /*
     * Never log:
     * - client secret
     * - access token
     */
  });

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,

      "Content-Type": "application/json",

      Accept: "application/json",

      "PayPal-Request-Id": requestId,
    },

    body: JSON.stringify(payload),
  });

  try {
    const body = await parsePayPalResponse(response);

    console.log("[PayPal] Create order success", {
      orderId: body?.id,
      status: body?.status,
      requestId,
    });

    return body;
  } catch (error) {
    console.error("[PayPal] Create order failed", {
      status: error?.status || response.status,

      paypalName: error?.paypalName,

      message: error?.message,

      debugId: error?.debugId,

      requestId,

      details: error?.details,

      paypal: error?.paypal,
    });

    throw error;
  }
}

export async function capturePayPalOrder(orderId) {
  const token = await getPayPalAccessToken();

  const requestId = crypto.randomUUID();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,

        "Content-Type": "application/json",

        Accept: "application/json",

        "PayPal-Request-Id": requestId,
      },

      body: "{}",
    },
  );

  try {
    return await parsePayPalResponse(response);
  } catch (error) {
    console.error("[PayPal] Capture order failed", {
      orderId,

      status: error?.status || response.status,

      paypalName: error?.paypalName,

      message: error?.message,

      debugId: error?.debugId,

      details: error?.details,
    });

    throw error;
  }
}

export async function getPayPalOrder(orderId) {
  const token = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,

        Accept: "application/json",
      },
    },
  );

  try {
    return await parsePayPalResponse(response);
  } catch (error) {
    console.error("[PayPal] Get order failed", {
      orderId,

      status: error?.status || response.status,

      paypalName: error?.paypalName,

      message: error?.message,

      debugId: error?.debugId,

      details: error?.details,
    });

    throw error;
  }
}

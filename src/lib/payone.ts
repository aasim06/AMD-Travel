import crypto from "crypto";

export interface PayoneConfig {
  pspid: string;
  apiKeyId: string;
  secretApiKey: string;
  merchantId: string;
  portalId: string;
  key: string;
  subAccId: string;
  mode: "test" | "live";
  environment: "preprod" | "prod";
  gatewayUrl: string;
}

export function getPayoneConfig(): PayoneConfig {
  const pspid = process.env.PAYONE_PSPID || "amdmobilitysolutionsug";
  return {
    pspid,
    apiKeyId: process.env.PAYONE_API_KEY_ID || "46E14952EFDA9A1C8B2E",
    secretApiKey: process.env.PAYONE_SECRET_API_KEY || "B8A8ECE2CB4C57C2B322D32756F8CEADF35B8BC61775F7DD25B16275C7368C7F6CCA50FC07A868650D3C6AFEE0EB3CB40AA373161AC0C32D801F940A611D8DA9",
    merchantId: process.env.PAYONE_MERCHANT_ID || pspid,
    portalId: process.env.PAYONE_PORTAL_ID || "2000000",
    key: process.env.PAYONE_SECRET_API_KEY || process.env.PAYONE_KEY || "",
    subAccId: process.env.PAYONE_SUBACC_ID || "30000",
    mode: (process.env.PAYONE_MODE === "live" ? "live" : "test") as "test" | "live",
    environment: (process.env.PAYONE_ENVIRONMENT === "prod" ? "prod" : "preprod") as "preprod" | "prod",
    gatewayUrl: process.env.PAYONE_GATEWAY_URL || "https://api.preprod.payone.com/post-gateway/",
  };
}

export interface PayoneInitPaymentParams {
  reference: string;
  amount: number; // in EUR (decimal, e.g. 149.99)
  currency?: string; // default EUR
  firstName: string;
  lastName: string;
  email: string;
  country?: string; // default DE
  paymentType?: "sb" | "cc" | "elv" | "wlt"; // sb = Online Bank Transfer (Sofort/Giropay), cc = Credit Card, elv = SEPA, wlt = Wallet
  onlineBankTransferType?: "PNT" | "GPY" | "EPS"; // PNT = Sofort, GPY = Giropay, EPS = eps
  successUrl: string;
  errorUrl: string;
  backUrl: string;
  customData?: Record<string, string>;
}

export interface PayoneResponse {
  status: "APPROVED" | "REDIRECT" | "ERROR" | "PENDING";
  txid?: string;
  userid?: string;
  redirecturl?: string;
  errorcode?: string;
  errormessage?: string;
  customermessage?: string;
  raw?: Record<string, string>;
}

/**
 * Sends a server-to-server request to PAYONE Post-Gateway
 */
export async function createPayonePayment(params: PayoneInitPaymentParams): Promise<PayoneResponse> {
  const config = getPayoneConfig();
  const amountCents = Math.round(params.amount * 100);

  // Hash key with MD5 as per PAYONE specification
  const md5Key = crypto.createHash("md5").update(config.key).digest("hex");

  const clearingType = params.paymentType || "sb";

  const payload: Record<string, string> = {
    mid: config.merchantId,
    portalid: config.portalId,
    key: md5Key,
    mode: config.mode,
    request: "authorization",
    clearingtype: clearingType,
    aid: config.subAccId,
    amount: amountCents.toString(),
    currency: params.currency || "EUR",
    reference: params.reference,
    narrative_text: "AMD Global Travel Booking",
    firstname: params.firstName || "Traveler",
    lastname: params.lastName || "Guest",
    email: params.email,
    country: params.country || "DE",
    successurl: params.successUrl,
    errorurl: params.errorUrl,
    backurl: params.backUrl,
    encoding: "UTF-8",
  };

  if (clearingType === "sb") {
    payload.onlinebanktransfertype = params.onlineBankTransferType || "PNT"; // Sofort by default
  }

  if (params.customData) {
    payload.param = JSON.stringify(params.customData);
  }

  // Check if credentials are mock/sandbox placeholders
  const isPlaceholderConfig =
    config.merchantId === "10000" ||
    config.portalId === "2000000" ||
    config.key.includes("secret_key_testing");

  try {
    const bodyParams = new URLSearchParams(payload);

    const res = await fetch(config.gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
      signal: AbortSignal.timeout(8000),
    });

    const responseText = await res.text();
    const parsedData = parsePayoneResponse(responseText);

    if (parsedData.status === "REDIRECT" && parsedData.redirecturl) {
      return parsedData;
    }

    if (parsedData.status === "APPROVED") {
      return parsedData;
    }

    // If in test mode or placeholder credentials, route to interactive test sandbox simulator
    if (isPlaceholderConfig || config.mode === "test") {
      const methodKey =
        params.paymentType === "sb"
          ? params.onlineBankTransferType === "GPY"
            ? "giropay"
            : "sofort"
          : params.paymentType === "elv"
          ? "sepa"
          : "card";

      let origin = "http://localhost:3000";
      try {
        const u = new URL(params.successUrl);
        origin = u.origin;
      } catch {}

      const mockTxId = "PAYONE_TEST_" + Date.now();
      const simulatorUrl = `${origin}/checkout/payone/simulator?txid=${mockTxId}&ref=${encodeURIComponent(
        params.reference
      )}&amount=${params.amount}&currency=${encodeURIComponent(
        params.currency || "EUR"
      )}&method=${methodKey}&successUrl=${encodeURIComponent(
        params.successUrl + `&txid=${mockTxId}&sandbox=true`
      )}&errorUrl=${encodeURIComponent(
        params.errorUrl + `&txid=${mockTxId}&sandbox=true`
      )}`;

      return {
        status: "REDIRECT",
        txid: mockTxId,
        redirecturl: simulatorUrl,
        raw: { ...parsedData.raw, simulated: "true" },
      };
    }

    return parsedData;
  } catch (error: any) {
    console.error("[PAYONE Gateway Request Failed]:", error?.message || error);

    // If sandbox/test, gracefully route to simulator
    if (isPlaceholderConfig || config.mode === "test") {
      const mockTxId = "PAYONE_TEST_" + Date.now();
      let origin = "http://localhost:3000";
      try {
        const u = new URL(params.successUrl);
        origin = u.origin;
      } catch {}

      const simulatorUrl = `${origin}/checkout/payone/simulator?txid=${mockTxId}&ref=${encodeURIComponent(
        params.reference
      )}&amount=${params.amount}&currency=${encodeURIComponent(
        params.currency || "EUR"
      )}&method=sofort&successUrl=${encodeURIComponent(
        params.successUrl + `&txid=${mockTxId}&sandbox=true`
      )}&errorUrl=${encodeURIComponent(
        params.errorUrl + `&txid=${mockTxId}&sandbox=true`
      )}`;

      return {
        status: "REDIRECT",
        txid: mockTxId,
        redirecturl: simulatorUrl,
      };
    }

    return {
      status: "ERROR",
      errorcode: "CONNECTION_FAILED",
      errormessage: error?.message || "Could not connect to PAYONE gateway",
    };
  }
}

/**
 * Parses PAYONE newline-delimited key=value response format
 */
function parsePayoneResponse(text: string): PayoneResponse {
  const lines = text.split(/\r?\n/);
  const data: Record<string, string> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf("=");
    if (idx > -1) {
      const k = trimmed.substring(0, idx).trim();
      const v = trimmed.substring(idx + 1).trim();
      data[k] = v;
    }
  }

  const status = (data.status as any) || "ERROR";

  return {
    status: ["APPROVED", "REDIRECT", "PENDING"].includes(status) ? status : "ERROR",
    txid: data.txid,
    userid: data.userid,
    redirecturl: data.redirecturl,
    errorcode: data.errorcode,
    errormessage: data.errormessage,
    customermessage: data.customermessage,
    raw: data,
  };
}

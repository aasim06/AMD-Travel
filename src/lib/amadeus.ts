import dns from "node:dns";

// Fix Node.js IPv6-first DNS resolution issue
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* ignore */
}

// ─── Centralized Amadeus Enterprise API Configuration ──────────────────────────

export const AMADEUS_BASE_URL =
  process.env.AMADEUS_ENV === "production" || process.env.AMADEUS_ENV === "pro"
    ? "https://travel.api.amadeus.com"
    : "https://test.travel.api.amadeus.com";

export const AMADEUS_API_BASE = AMADEUS_BASE_URL;
export const amadeusBaseUrl = AMADEUS_BASE_URL;

export function amadeusHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

// ─── Token Fetch Logic ────────────────────────────────────────────────────────

export async function getAmadeusToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 30_000) {
    return tokenCache.token;
  }

  const clientId = (process.env.AMADEUS_CLIENT_ID ?? "").trim();
  const clientSecret = (process.env.AMADEUS_CLIENT_SECRET ?? "").trim();

  if (!clientId || !clientSecret) {
    throw new Error("AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET must be set in environment variables");
  }

  const tokenUrl = `${AMADEUS_BASE_URL}/v1/security/oauth2/token`;
  console.log(`[Amadeus Auth] Requesting token from: ${tokenUrl} (client_id: ${clientId.slice(0, 6)}...)`);

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  }).toString();

  let response: Response;
  try {
    response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(4000),
    });
  } catch (err: unknown) {
    const errorObj = err as Error & { cause?: unknown };
    const causeMsg = errorObj?.cause ? JSON.stringify(errorObj.cause) : errorObj.message;
    console.error(`[Amadeus Auth DNS/Network Error] Failed to reach ${tokenUrl}:`, causeMsg);
    throw new Error(`Cannot reach Amadeus auth server at ${tokenUrl}: ${errorObj.message}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Amadeus Auth HTTP ${response.status}] ${tokenUrl} failed body:`, errorText);
    throw new Error(`Amadeus token request failed [HTTP ${response.status}]: ${errorText}`);
  }

  const json = (await response.json()) as { access_token: string; expires_in: number };
  console.log(`[Amadeus Auth OK] Token received. Expires in ${json.expires_in}s`);

  tokenCache = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 1799) * 1000,
  };

  return tokenCache.token;
}

// ─── Centralized Fetch Helper for Amadeus Endpoints ───────────────────────────

export async function amadeusFetch(
  endpointPath: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
    params?: URLSearchParams;
  } = {}
): Promise<unknown> {
  const { method = "GET", token, body, params } = options;
  const queryString = params ? `?${params.toString()}` : "";
  const fullUrl = `${AMADEUS_BASE_URL}${endpointPath.startsWith("/") ? "" : "/"}${endpointPath}${queryString}`;

  console.log(`[Amadeus API Call] ${method} ${fullUrl}`);

  const authToken = token ?? (await getAmadeusToken());

  const headers: Record<string, string> = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(3000),
    });
  } catch (err: unknown) {
    const errorObj = err as Error & { cause?: unknown };
    const causeMsg = errorObj?.cause ? JSON.stringify(errorObj.cause) : errorObj.message;
    console.error(`[Amadeus API Network/DNS Error] ${method} ${fullUrl} failed:`, causeMsg);
    throw new Error(`Amadeus network request failed for ${fullUrl}: ${errorObj.message}`);
  }

  const responseText = await response.text();

  if (!response.ok) {
    console.error(`[Amadeus API Error HTTP ${response.status}] ${fullUrl}:`, responseText);
    throw new Error(`Amadeus API error [HTTP ${response.status}] at ${fullUrl}: ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

export async function amadeusGet(path: string, token: string): Promise<unknown> {
  return amadeusFetch(path, { method: "GET", token });
}

export async function amadeusPost(path: string, token: string, payload: unknown): Promise<unknown> {
  return amadeusFetch(path, { method: "POST", token, body: payload });
}

export interface AmadeusTravelerInput {
  id: string;
  dateOfBirth: string;
  name: {
    firstName: string;
    lastName: string;
  };
  gender?: "MALE" | "FEMALE";
  contact?: {
    emailAddress?: string;
    phones?: Array<{
      deviceType: "MOBILE" | "LANDLINE";
      countryCallingCode?: string;
      number: string;
    }>;
  };
  documents?: Array<{
    documentType: "PASSPORT";
    number: string;
    expiryDate: string;
    issuanceCountry: string;
    nationality: string;
    holder: boolean;
  }>;
}

export async function amadeusCreateFlightOrder(
  rawOffer: unknown,
  travelers: AmadeusTravelerInput[],
  token?: string
): Promise<unknown> {
  const authToken = token ?? (await getAmadeusToken());
  const payload = {
    data: {
      type: "flight-order",
      flightOffers: [rawOffer],
      travelers,
    },
  };
  return amadeusPost("/v1/booking/flight-orders", authToken, payload);
}
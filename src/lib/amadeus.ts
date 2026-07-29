const AMADEUS_TOKEN_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";
export const AMADEUS_API_BASE = "https://test.api.amadeus.com";
export const amadeusBaseUrl = AMADEUS_API_BASE;

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

export async function getAmadeusToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 30_000) {
    return tokenCache.token;
  }

  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET must be set in environment variables");
  }

  console.log("[Amadeus] Requesting token - client_id:", clientId.slice(0, 6) + "...");

  let res: Response;
  try {
    res = await fetch(AMADEUS_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });
  } catch (err) {
    const cause = err instanceof Error ? err.message : String(err);
    console.error("[Amadeus] Token fetch FAILED - cause:", cause);
    throw new Error(`Cannot reach Amadeus auth server: ${cause}`);
  }

  if (!res.ok) {
    let body: unknown = {};
    try { body = await res.json(); } catch { /* Ignore */ }
    console.error("[Amadeus] Token HTTP error - status:", res.status, "body:", JSON.stringify(body));
    throw new Error(`Token request failed: HTTP ${res.status}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  console.log("[Amadeus] Token OK - expires in", json.expires_in, "s");

  tokenCache = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };

  return tokenCache.token;
}
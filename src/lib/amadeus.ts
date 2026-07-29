const AMADEUS_TOKEN_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";
const AMADEUS_API_BASE  = "https://test.api.amadeus.com";

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

export async function getAmadeusToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 30_000) {
    return tokenCache.token;
  }

  const clientId     = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET must be set in environment variables");
  }

  console.log("[Amadeus] Requesting token — client_id:", clientId.slice(0, 6) + "...");

  let res: Response;
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
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[Amadeus] Token fetch FAILED — cause:", cause);
    if (stack) console.error("[Amadeus] Stack:", stack);
    throw new Error(`Cannot reach Amadeus auth server: ${cause}`);
  }

  if (!res.ok) {
    let body: unknown = {};
    try { body = await res.json(); } catch { /* ignore */ }
    console.error("[Amadeus] Token HTTP error — status:", res.status, "body:", JSON.stringify(body));
    const msg = (body as Record<string, string>)?.error_description ?? `Token request failed: HTTP ${res.status}`;
    throw new Error(msg);
  }

  const json = await res.json() as { access_token: string; expires_in: number };
  console.log("[Amadeus] Token OK — expires in", json.expires_in, "s");

  tokenCache = {
    token:     json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };

  return tokenCache.token;
}

export function amadeusHeaders(token: string): Record<string, string> {
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type":  "application/json",
  };
}

export function amadeusBaseUrl(): string {
  return process.env.AMADEUS_BASE_URL ?? AMADEUS_API_BASE;
}

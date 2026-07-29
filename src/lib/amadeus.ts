// Allow self-signed / IP-addressed TLS certs in dev (Node.js only)
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}

let tokenCache: TokenCache | null = null;

export async function getAmadeusToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 30_000) {
    return tokenCache.token;
  }

  const clientId     = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET must be set in .env.local"
    );
  }

  const baseUrl = process.env.AMADEUS_BASE_URL ?? "https://test.api.amadeus.com";

  let res: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      res = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Host":         "test.api.amadeus.com",
        },
        body: new URLSearchParams({
          grant_type:    "client_credentials",
          client_id:     clientId,
          client_secret: clientSecret,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    const cause     = err instanceof Error ? err.message : String(err);
    const stack     = err instanceof Error ? err.stack : undefined;
    console.error("[Amadeus] Token fetch error:", cause);
    if (stack) console.error("[Amadeus] Stack:", stack);
    throw new Error(
      isTimeout
        ? "Amadeus auth timed out. Check network connectivity."
        : `Cannot reach Amadeus auth server (${cause}). Check DNS / network connectivity.`
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg  = body?.error_description ?? `Token request failed: HTTP ${res.status}`;
    console.error("[Amadeus] Token error — status:", res.status, "body:", JSON.stringify(body));
    throw new Error(msg);
  }

  const json = await res.json();
  tokenCache = {
    token:     json.access_token as string,
    expiresAt: Date.now() + (json.expires_in as number) * 1000,
  };

  console.log("[Amadeus] Token refreshed, expires in", json.expires_in, "s");
  return tokenCache.token;
}

export function amadeusHeaders(token: string): Record<string, string> {
  return {
    "Authorization":  `Bearer ${token}`,
    "Content-Type":   "application/json",
    "Host":           "test.api.amadeus.com",
  };
}

export function amadeusBaseUrl(): string {
  return process.env.AMADEUS_BASE_URL ?? "https://test.api.amadeus.com";
}

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
  const baseUrl      = process.env.AMADEUS_BASE_URL ?? "https://test.api.amadeus.com";

  console.log("[Amadeus] Fetching token from:", `${baseUrl}/v1/security/oauth2/token`);
  console.log("[Amadeus] Using client_id:", clientId ? `${clientId.slice(0, 6)}...` : "MISSING");

  if (!clientId || !clientSecret) {
    throw new Error("AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET must be set in .env.local");
  }

  let res: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      res = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
    console.error("[Amadeus] Token fetch FAILED:", cause);
    if (stack) console.error("[Amadeus] Stack trace:", stack);
    throw new Error(
      isTimeout
        ? "Amadeus auth timed out. Check network connectivity."
        : `Cannot reach Amadeus auth server (${cause}). Check DNS / network.`
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg  = body?.error_description ?? `Token request failed: HTTP ${res.status}`;
    console.error("[Amadeus] Token error — HTTP status:", res.status);
    console.error("[Amadeus] Token error — response body:", JSON.stringify(body));
    throw new Error(msg);
  }

  const json = await res.json();
  tokenCache = {
    token:     json.access_token as string,
    expiresAt: Date.now() + (json.expires_in as number) * 1000,
  };

  console.log("[Amadeus] Token refreshed successfully, expires in", json.expires_in, "s");
  return tokenCache.token;
}

export function amadeusHeaders(token: string): Record<string, string> {
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type":  "application/json",
  };
}

export function amadeusBaseUrl(): string {
  return process.env.AMADEUS_BASE_URL ?? "https://test.api.amadeus.com";
}

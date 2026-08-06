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

// ─── Fetch with timeout helper ─────────────────────────────────────────────────
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ─── Token fetch with retry ────────────────────────────────────────────────────
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

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  }).toString();

  const options: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  };

  // Retry up to 2 times with 8s timeout each
  let lastErr: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    let res: Response;
    try {
      res = await fetchWithTimeout(AMADEUS_TOKEN_URL, options, 8000);
    } catch (err) {
      lastErr = err;
      const cause = err instanceof Error ? err.message : String(err);
      console.warn(`[Amadeus] Token fetch attempt ${attempt} FAILED - cause:`, cause);
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000)); // wait 1s before retry
      continue;
    }

    if (!res.ok) {
      let respBody: unknown = {};
      try { respBody = await res.json(); } catch { /* ignore */ }
      console.error("[Amadeus] Token HTTP error - status:", res.status, "body:", JSON.stringify(respBody));
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

  const cause = lastErr instanceof Error ? lastErr.message : String(lastErr);
  console.warn("[Amadeus] Token fetch FAILED after retries - cause:", cause);
  throw new Error(`Cannot reach Amadeus auth server: ${cause}`);
}
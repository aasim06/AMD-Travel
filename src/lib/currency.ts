export type CurrencyCode = "USD" | "EUR";

export const RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
};

export const SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
};

export function formatPrice(amountInUSD: number, currency: CurrencyCode = "USD"): string {
  const converted = Math.round(amountInUSD * (RATES[currency] ?? 1));
  const symbol    = SYMBOLS[currency] ?? "$";
  return `${symbol}${converted.toLocaleString()}`;
}

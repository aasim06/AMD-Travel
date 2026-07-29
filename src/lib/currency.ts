export type CurrencyCode = "USD" | "EUR" | "PKR";

export const RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  PKR: 278,
};

export const SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  PKR: "PKR ",
};

export function formatPrice(amountInUSD: number, currency: CurrencyCode = "USD"): string {
  const converted = Math.round(amountInUSD * (RATES[currency] ?? 1));
  const symbol    = SYMBOLS[currency] ?? "$";
  return `${symbol}${converted.toLocaleString()}`;
}

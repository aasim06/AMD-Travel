export type CurrencyCode = "USD" | "EUR" | "GBP" | "SAR" | "AED" | "PKR";

export const RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.67,
  PKR: 278.5,
};

export const SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  SAR: "﷼",
  AED: "AED ",
  PKR: "Rs ",
};

export function formatPrice(amountInUSD: number, currency: CurrencyCode = "USD"): string {
  const converted = Math.round(amountInUSD * (RATES[currency] ?? 1));
  const symbol    = SYMBOLS[currency] ?? "$";
  return `${symbol}${converted.toLocaleString()}`;
}

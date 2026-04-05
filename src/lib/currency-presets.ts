export type CurrencyMarketPreset = {
  id: string;
  label: string;
  code: string;
  symbol: string;
  locale: string;
  decimalPlaces: number;
};

/** Presets for Company settings — selecting one fills ISO code, symbol, locale, and decimals for the whole storefront. */
export const CURRENCY_MARKET_PRESETS: CurrencyMarketPreset[] = [
  { id: "IN", label: "India (INR, ₹)", code: "INR", symbol: "₹", locale: "en-IN", decimalPlaces: 2 },
  { id: "US", label: "United States (USD, $)", code: "USD", symbol: "$", locale: "en-US", decimalPlaces: 2 },
  { id: "GB", label: "United Kingdom (GBP, £)", code: "GBP", symbol: "£", locale: "en-GB", decimalPlaces: 2 },
  { id: "EU", label: "Eurozone (EUR, €)", code: "EUR", symbol: "€", locale: "de-DE", decimalPlaces: 2 },
  { id: "AE", label: "United Arab Emirates (AED)", code: "AED", symbol: "د.إ", locale: "en-AE", decimalPlaces: 2 },
  { id: "SG", label: "Singapore (SGD)", code: "SGD", symbol: "S$", locale: "en-SG", decimalPlaces: 2 },
  { id: "AU", label: "Australia (AUD)", code: "AUD", symbol: "A$", locale: "en-AU", decimalPlaces: 2 },
  { id: "CA", label: "Canada (CAD)", code: "CAD", symbol: "C$", locale: "en-CA", decimalPlaces: 2 },
  { id: "JP", label: "Japan (JPY, ¥)", code: "JPY", symbol: "¥", locale: "ja-JP", decimalPlaces: 0 },
];

export function matchPresetId(settings: {
  currencyCode: string;
  currencyLocale: string;
  currencyDecimalPlaces: number;
}): string {
  const code = settings.currencyCode.trim().toUpperCase();
  const loc = settings.currencyLocale.trim();
  const dec = settings.currencyDecimalPlaces;
  const hit = CURRENCY_MARKET_PRESETS.find(
    (p) => p.code === code && p.locale === loc && p.decimalPlaces === dec
  );
  return hit?.id ?? "custom";
}

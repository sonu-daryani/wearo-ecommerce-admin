"use client";

import type { CompanySettings } from "@prisma/client";
import { useState } from "react";
import { CURRENCY_MARKET_PRESETS, matchPresetId } from "@/lib/currency-presets";

export function CompanySettingsCurrencyFields({ settings: s }: { settings: CompanySettings }) {
  const [presetId, setPresetId] = useState(() => matchPresetId(s));
  const [currencyCode, setCurrencyCode] = useState(s.currencyCode);
  const [currencySymbol, setCurrencySymbol] = useState(s.currencySymbol);
  const [currencyLocale, setCurrencyLocale] = useState(s.currencyLocale);
  const [currencyDecimalPlaces, setCurrencyDecimalPlaces] = useState(s.currencyDecimalPlaces);

  function applyPreset(id: string) {
    setPresetId(id);
    if (id === "custom") return;
    const p = CURRENCY_MARKET_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setCurrencyCode(p.code);
    setCurrencySymbol(p.symbol);
    setCurrencyLocale(p.locale);
    setCurrencyDecimalPlaces(p.decimalPlaces);
  }

  function markCustom() {
    setPresetId("custom");
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="currencyMarketPreset" className="block text-sm font-medium text-slate-700 mb-1">
          Store region / currency
        </label>
        <select
          id="currencyMarketPreset"
          value={presetId}
          onChange={(e) => applyPreset(e.target.value)}
          className="w-full max-w-xl rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
        >
          <option value="custom">Custom (edit fields below)</option>
          {CURRENCY_MARKET_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">
          Choosing a market updates code, symbol, locale, and decimals together. The storefront reads these via{" "}
          <code className="bg-slate-100 px-1 rounded">/api/company-settings</code> for all product prices and checkout.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="currencyCode" className="block text-sm font-medium text-slate-700 mb-1">
            ISO code
          </label>
          <input
            id="currencyCode"
            name="currencyCode"
            value={currencyCode}
            onChange={(e) => {
              markCustom();
              setCurrencyCode(e.target.value.toUpperCase());
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono uppercase"
          />
        </div>
        <div>
          <label htmlFor="currencySymbol" className="block text-sm font-medium text-slate-700 mb-1">
            Symbol
          </label>
          <input
            id="currencySymbol"
            name="currencySymbol"
            value={currencySymbol}
            onChange={(e) => {
              markCustom();
              setCurrencySymbol(e.target.value);
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="currencyLocale" className="block text-sm font-medium text-slate-700 mb-1">
            Locale (Intl)
          </label>
          <input
            id="currencyLocale"
            name="currencyLocale"
            value={currencyLocale}
            onChange={(e) => {
              markCustom();
              setCurrencyLocale(e.target.value);
            }}
            placeholder="en-IN"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
          />
        </div>
        <div>
          <label htmlFor="currencyDecimalPlaces" className="block text-sm font-medium text-slate-700 mb-1">
            Decimal places
          </label>
          <input
            id="currencyDecimalPlaces"
            name="currencyDecimalPlaces"
            type="number"
            min={0}
            max={4}
            value={currencyDecimalPlaces}
            onChange={(e) => {
              markCustom();
              setCurrencyDecimalPlaces(Math.min(4, Math.max(0, Number(e.target.value) || 0)));
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

/** Tailwind-style HSL tokens: `"217 91% 42%"` for `hsl(var(--primary))`. */

export type HslParts = { h: number; s: number; l: number };

export function parseHslString(input: string): HslParts | null {
  const t = input.trim();
  const m = t.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (!m) return null;
  const h = Number(m[1]);
  const s = Number(m[2]);
  const l = Number(m[3]);
  if (![h, s, l].every(Number.isFinite)) return null;
  return {
    h: ((h % 360) + 360) % 360,
    s: Math.min(100, Math.max(0, s)),
    l: Math.min(100, Math.max(0, l)),
  };
}

export function formatHsl(parts: HslParts): string {
  return `${Math.round(parts.h)} ${Math.round(parts.s)}% ${Math.round(parts.l)}%`;
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const S = s / 100;
  const L = l / 100;
  const c = (1 - Math.abs(2 * L - 1)) * S;
  const hh = h / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hh >= 0 && hh < 1) {
    r1 = c;
    g1 = x;
  } else if (hh < 2) {
    r1 = x;
    g1 = c;
  } else if (hh < 3) {
    g1 = c;
    b1 = x;
  } else if (hh < 4) {
    g1 = x;
    b1 = c;
  } else if (hh < 5) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }
  const m = L - c / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

export function hslStringToHex(hsl: string): string | null {
  const p = parseHslString(hsl);
  if (!p) return null;
  const { r, g, b } = hslToRgb(p.h, p.s, p.l);
  const hx = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hx(r)}${hx(g)}${hx(b)}`;
}

export function hexToHslString(hex: string): string {
  let h = hex.replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return "0 0% 50%";
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let H = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        H = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        H = ((b - r) / d + 2) / 6;
        break;
      default:
        H = ((r - g) / d + 4) / 6;
    }
  }
  return formatHsl({ h: H * 360, s: s * 100, l: l * 100 });
}

/** Curated presets for the storefront theme editor. */
export const THEME_COLOR_PRESETS: { label: string; hsl: string }[] = [
  { label: "Indigo", hsl: "217 91% 42%" },
  { label: "Sky", hsl: "199 89% 48%" },
  { label: "Teal", hsl: "173 80% 36%" },
  { label: "Emerald", hsl: "160 84% 32%" },
  { label: "Amber", hsl: "38 92% 50%" },
  { label: "Rose", hsl: "346 77% 50%" },
  { label: "Violet", hsl: "263 70% 50%" },
  { label: "Slate", hsl: "215 16% 47%" },
  { label: "Ink", hsl: "222 47% 11%" },
  { label: "Paper", hsl: "220 20% 97%" },
];

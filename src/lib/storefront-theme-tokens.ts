/** CSS custom properties saved in `CompanySettings.theme` (Tailwind HSL triplets). */
export const STOREFRONT_THEME_TOKEN_KEYS = [
  "--primary",
  "--background",
  "--foreground",
  "--radius",
  "--banner-bg",
  "--banner-fg",
  "--navbar-bg",
  "--navbar-fg",
  "--footer-bar-bg",
  "--hero-bg",
] as const;

export type StorefrontThemeTokenKey = (typeof STOREFRONT_THEME_TOKEN_KEYS)[number];

export const STOREFRONT_THEME_DEFAULTS: Record<StorefrontThemeTokenKey, string> = {
  "--primary": "217 91% 42%",
  "--background": "220 20% 97%",
  "--foreground": "222 47% 11%",
  "--radius": "0.75rem",
  "--banner-bg": "0 0% 0%",
  "--banner-fg": "0 0% 100%",
  "--navbar-bg": "0 0% 100%",
  "--navbar-fg": "222 47% 11%",
  "--footer-bar-bg": "220 14% 96%",
  "--hero-bg": "330 18% 94%",
};

"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { hslStringToHex, hexToHslString, THEME_COLOR_PRESETS } from "@/lib/hsl-color";
import {
  STOREFRONT_THEME_DEFAULTS,
  STOREFRONT_THEME_TOKEN_KEYS,
} from "@/lib/storefront-theme-tokens";
import { updateThemeSettings, type ThemeSettingsFormState } from "../settings/theme/actions";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

const EDITOR_BLOCKS = ["topBanner", "navbar", "footer", "hero"] as const;
type EditorBlockId = (typeof EDITOR_BLOCKS)[number];

const PREVIEW_SCREENS = ["mobile", "tablet", "desktop"] as const;
type PreviewScreenId = (typeof PREVIEW_SCREENS)[number];

const PREVIEW_SCREEN_META: Record<
  PreviewScreenId,
  { label: string; widthPx: number | null; hint: string }
> = {
  mobile: { label: "Mobile", widthPx: 390, hint: "~phone width; sm/md breakpoints" },
  tablet: { label: "Tablet", widthPx: 820, hint: "~tablet width; md/lg breakpoints" },
  desktop: { label: "Desktop", widthPx: null, hint: "Full panel; xl breakpoints" },
};

function isEditorBlock(s: string): s is EditorBlockId {
  return (EDITOR_BLOCKS as readonly string[]).includes(s);
}

function ColorTokenField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hsl: string) => void;
}) {
  const hex = hslStringToHex(value) ?? "#6b7280";
  return (
    <div className="space-y-1">
      <label className="block text-xs text-slate-700">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(hexToHslString(e.target.value))}
          className="h-9 w-12 shrink-0 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
          title="Pick color"
          aria-label={`${label} color`}
        />
        <input
          className="min-w-0 flex-1 rounded border border-slate-300 px-2 py-1 text-xs font-mono"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function PalettePresets({ onPick, label }: { onPick: (hsl: string) => void; label: string }) {
  return (
    <div>
      <p className="text-[11px] text-slate-500 mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {THEME_COLOR_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            title={p.label}
            onClick={() => onPick(p.hsl)}
            className="h-7 w-7 rounded-full border border-slate-200 shadow-sm ring-offset-1 hover:ring-2 hover:ring-slate-400"
            style={{ background: `hsl(${p.hsl})` }}
          />
        ))}
      </div>
    </div>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-medium disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save / Publish"}
    </button>
  );
}

type Props = {
  storefrontUrl: string;
  initialTheme: Record<string, string>;
};

export default function EditorShell({ storefrontUrl, initialTheme }: Props) {
  const [theme, setTheme] = useState<Record<string, string>>(() => ({
    ...STOREFRONT_THEME_DEFAULTS,
    ...initialTheme,
  }));
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [state, formAction] = useFormState(updateThemeSettings, {} as ThemeSettingsFormState);
  const [selectedBlock, setSelectedBlock] = useState<EditorBlockId>("topBanner");
  const [previewScreen, setPreviewScreen] = useState<PreviewScreenId>("desktop");

  const previewTheme = useMemo(() => {
    const out: Record<string, string> = { ...STOREFRONT_THEME_DEFAULTS };
    for (const [k, v] of Object.entries(theme)) {
      const t = typeof v === "string" ? v.trim() : "";
      if (t) out[k] = v;
    }
    for (const k of STOREFRONT_THEME_TOKEN_KEYS) {
      if (!out[k]?.trim()) out[k] = STOREFRONT_THEME_DEFAULTS[k];
    }
    return out;
  }, [theme]);

  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: "editor:update", theme: previewTheme, selectedBlock, previewScreen },
      "*"
    );
  }, [previewTheme, selectedBlock, previewScreen]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as {
        type?: string;
        key?: string;
        value?: string;
        block?: string;
      };
      if (data?.type === "editor:contentChange" && data.key) {
        setTheme((prev) => ({ ...prev, [`content.${data.key}`]: data.value ?? "" }));
        return;
      }
      if (data?.type === "editor:blockSelect" && data.block && isEditorBlock(data.block)) {
        setSelectedBlock(data.block);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const pushToPreview = () => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: "editor:update", theme: previewTheme, selectedBlock, previewScreen },
      "*"
    );
  };

  const previewUrl = useMemo(() => `${storefrontUrl}/?editorPreview=1`, [storefrontUrl]);
  const contentEntries = useMemo(
    () => Object.entries(theme).filter(([k]) => k.startsWith("content.")),
    [theme]
  );

  const setField = (key: string, value: string) => setTheme((prev) => ({ ...prev, [key]: value }));

  const bannerBg = previewTheme["--banner-bg"];
  const bannerFg = previewTheme["--banner-fg"];
  const navbarBg = previewTheme["--navbar-bg"];
  const navbarFg = previewTheme["--navbar-fg"];
  const footerBarBg = previewTheme["--footer-bar-bg"];
  const heroBg = previewTheme["--hero-bg"];
  const primary = previewTheme["--primary"];
  const background = previewTheme["--background"];
  const foreground = previewTheme["--foreground"];
  const radius = previewTheme["--radius"];

  const screenBtn = (id: PreviewScreenId) => (
    <button
      key={id}
      type="button"
      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
        previewScreen === id
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      }`}
      onClick={() => setPreviewScreen(id)}
      title={PREVIEW_SCREEN_META[id].hint}
    >
      {PREVIEW_SCREEN_META[id].label}
    </button>
  );

  const tabBtn = (id: EditorBlockId, label: string) => (
    <button
      type="button"
      className={`px-2 py-1 rounded text-xs border ${
        selectedBlock === id ? "bg-slate-900 text-white" : "bg-white"
      }`}
      onClick={() => setSelectedBlock(id)}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full h-[calc(100vh-5rem)] min-h-[680px] rounded-xl border border-slate-200 bg-white overflow-hidden">
      <form action={formAction} className="h-full w-full min-w-0 flex">
        <aside className="w-[340px] shrink-0 border-r border-slate-200 p-4 space-y-4 overflow-y-auto">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Storefront Editor</h1>
            <p className="text-xs text-slate-500">
              Pick a section for colors on the left.{" "}
              <span className="font-medium text-slate-700">Double-click</span> text in the preview to
              edit it.
            </p>
            {state?.error && <p className="mt-2 text-xs text-red-700">{state.error}</p>}
          </div>

          {STOREFRONT_THEME_TOKEN_KEYS.map((k) => (
            <input key={k} type="hidden" name={k} value={previewTheme[k] ?? ""} />
          ))}

          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section</p>
            <div className="flex flex-wrap gap-2">
              {tabBtn("topBanner", "Banner")}
              {tabBtn("navbar", "Navbar")}
              {tabBtn("footer", "Footer")}
              {tabBtn("hero", "Hero")}
            </div>
          </section>

          {selectedBlock === "topBanner" && (
            <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
              <p className="text-xs font-semibold text-slate-800">Banner — colors</p>
              <PalettePresets onPick={(hsl) => setField("--banner-bg", hsl)} label="Quick palette → bar background" />
              <ColorTokenField label="Bar background" value={bannerBg} onChange={(v) => setField("--banner-bg", v)} />
              <ColorTokenField label="Bar text" value={bannerFg} onChange={(v) => setField("--banner-fg", v)} />
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs text-slate-700 mb-1">Top banner message</label>
                <RichTextEditor
                  compact
                  placeholder="Banner message…"
                  value={theme["content.topBannerMessage"] ?? ""}
                  onChange={(html) => setField("content.topBannerMessage", html)}
                />
              </div>
            </section>
          )}

          {selectedBlock === "navbar" && (
            <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
              <p className="text-xs font-semibold text-slate-800">Navbar — colors</p>
              <PalettePresets onPick={(hsl) => setField("--navbar-bg", hsl)} label="Quick palette → navbar background" />
              <ColorTokenField label="Navbar background" value={navbarBg} onChange={(v) => setField("--navbar-bg", v)} />
              <ColorTokenField label="Navbar text" value={navbarFg} onChange={(v) => setField("--navbar-fg", v)} />
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <p className="text-xs font-semibold text-slate-800">Navbar — copy</p>
                <label className="block text-xs text-slate-700">Brand</label>
                <RichTextEditor
                  compact
                  placeholder="Brand name…"
                  value={theme["content.navbarBrand"] ?? ""}
                  onChange={(html) => setField("content.navbarBrand", html)}
                />
                <label className="block text-xs text-slate-700">Menu: Shop</label>
                <RichTextEditor
                  compact
                  value={theme["content.navbarMenuShop"] ?? ""}
                  onChange={(html) => setField("content.navbarMenuShop", html)}
                />
                <label className="block text-xs text-slate-700">Menu: On Sale</label>
                <RichTextEditor
                  compact
                  value={theme["content.navbarMenuOnSale"] ?? ""}
                  onChange={(html) => setField("content.navbarMenuOnSale", html)}
                />
                <label className="block text-xs text-slate-700">Menu: New Arrivals</label>
                <RichTextEditor
                  compact
                  value={theme["content.navbarMenuNewArrivals"] ?? ""}
                  onChange={(html) => setField("content.navbarMenuNewArrivals", html)}
                />
                <label className="block text-xs text-slate-700">Menu: Brands</label>
                <RichTextEditor
                  compact
                  value={theme["content.navbarMenuBrands"] ?? ""}
                  onChange={(html) => setField("content.navbarMenuBrands", html)}
                />
              </div>
            </section>
          )}

          {selectedBlock === "footer" && (
            <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
              <p className="text-xs font-semibold text-slate-800">Footer — colors</p>
              <PalettePresets
                onPick={(hsl) => setField("--footer-bar-bg", hsl)}
                label="Quick palette → footer background"
              />
              <ColorTokenField
                label="Footer gray background"
                value={footerBarBg}
                onChange={(v) => setField("--footer-bar-bg", v)}
              />
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <p className="text-xs font-semibold text-slate-800">Footer — copy</p>
                <label className="block text-xs text-slate-700">Brand</label>
                <RichTextEditor
                  compact
                  value={theme["content.footerBrand"] ?? ""}
                  onChange={(html) => setField("content.footerBrand", html)}
                />
                <label className="block text-xs text-slate-700">Tagline</label>
                <RichTextEditor
                  compact
                  placeholder="Short tagline…"
                  value={theme["content.footerTagline"] ?? ""}
                  onChange={(html) => setField("content.footerTagline", html)}
                />
              </div>
            </section>
          )}

          {selectedBlock === "hero" && (
            <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
              <p className="text-xs font-semibold text-slate-800">Hero — colors & site tokens</p>
              <PalettePresets onPick={(hsl) => setField("--primary", hsl)} label="Quick palette → primary (buttons & accents)" />
              <ColorTokenField label="Primary" value={primary} onChange={(v) => setField("--primary", v)} />
              <ColorTokenField label="Page background" value={background} onChange={(v) => setField("--background", v)} />
              <ColorTokenField label="Body text" value={foreground} onChange={(v) => setField("--foreground", v)} />
              <ColorTokenField label="Hero strip background" value={heroBg} onChange={(v) => setField("--hero-bg", v)} />
              <label className="block text-xs text-slate-700">Radius</label>
              <input
                className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono bg-white"
                value={radius}
                onChange={(e) => setField("--radius", e.target.value)}
              />
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <p className="text-xs font-semibold text-slate-800">Hero — copy</p>
                <label className="block text-xs text-slate-700">Headline</label>
                <RichTextEditor
                  compact
                  placeholder="Hero headline…"
                  value={theme["content.heroTitle"] ?? ""}
                  onChange={(html) => setField("content.heroTitle", html)}
                />
                <label className="block text-xs text-slate-700">Subtext</label>
                <RichTextEditor
                  compact
                  placeholder="Supporting line…"
                  value={theme["content.heroSubtitle"] ?? ""}
                  onChange={(html) => setField("content.heroSubtitle", html)}
                />
                <label className="block text-xs text-slate-700">CTA button</label>
                <RichTextEditor
                  compact
                  placeholder="Shop now"
                  value={theme["content.heroCta"] ?? ""}
                  onChange={(html) => setField("content.heroCta", html)}
                />
              </div>
            </section>
          )}

          <section className="hidden" aria-hidden>
            {contentEntries.map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value ?? ""} />
            ))}
          </section>

          <div className="pt-2 border-t border-slate-200">
            <SaveButton />
          </div>
        </aside>

        <section className="flex-1 flex flex-col min-h-0 min-w-0 bg-slate-200/80">
          <div className="shrink-0 flex flex-wrap items-center gap-2 px-3 py-2 border-b border-slate-200 bg-white">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Screen
            </span>
            <div className="flex gap-1.5">
              {PREVIEW_SCREENS.map((id) => screenBtn(id))}
            </div>
            <span className="text-[11px] text-slate-400 ml-auto hidden sm:inline">
              {PREVIEW_SCREEN_META[previewScreen].hint}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {PREVIEW_SCREEN_META[previewScreen].widthPx != null
                ? `${PREVIEW_SCREEN_META[previewScreen].widthPx}px`
                : "100%"}
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-auto flex justify-center p-3 sm:p-4">
            <div
              className={`h-full min-h-[520px] bg-white shadow-lg border border-slate-300/80 rounded-t-lg overflow-hidden transition-[width] duration-200 ease-out ${
                previewScreen === "desktop" ? "w-full max-w-none" : ""
              }`}
              style={
                previewScreen === "desktop"
                  ? undefined
                  : { width: PREVIEW_SCREEN_META[previewScreen].widthPx ?? undefined }
              }
            >
              <iframe
                ref={iframeRef}
                title="Storefront preview"
                src={previewUrl}
                className="w-full h-full min-h-[520px] border-0 block"
                onLoad={pushToPreview}
              />
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}

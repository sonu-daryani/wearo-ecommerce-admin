"use client";

import type { CompanySettings } from "@prisma/client";
import { useFormState, useFormStatus } from "react-dom";
import { useMemo } from "react";
import { useAdminFormToast } from "@/hooks/use-admin-form-toast";
import type { ThemeSettingsFormState } from "./actions";
import { updateThemeSettings } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-slate-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save theme"}
    </button>
  );
}

function Field({
  label,
  name,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
      />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function ThemeSettingsForm({ settings }: { settings: CompanySettings }) {
  const initial: ThemeSettingsFormState = {};
  const [state, action] = useFormState(updateThemeSettings, initial);
  useAdminFormToast(state, { successMessage: "Theme saved" });

  const theme = useMemo(() => {
    const raw = (settings as unknown as { theme?: unknown }).theme;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, string>;
    return {};
  }, [settings]);

  const primary = theme["--primary"] ?? "217 91% 42%";
  const background = theme["--background"] ?? "220 20% 97%";
  const foreground = theme["--foreground"] ?? "222 47% 11%";
  const radius = theme["--radius"] ?? "0.75rem";

  return (
    <form action={action} className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {state.error && <div className="rounded-lg bg-red-50 text-red-800 text-sm px-4 py-3">{state.error}</div>}

      <div className="grid gap-5">
        <Field
          label="Primary color (HSL)"
          name="--primary"
          defaultValue={primary}
          hint='Example: "217 91% 42%"'
        />
        <Field
          label="Background (HSL)"
          name="--background"
          defaultValue={background}
          hint='Example: "220 20% 97%"'
        />
        <Field
          label="Foreground/text (HSL)"
          name="--foreground"
          defaultValue={foreground}
          hint='Example: "222 47% 11%"'
        />
        <Field label="Border radius" name="--radius" defaultValue={radius} hint='Example: "0.75rem"' />
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-900 mb-2">Preview</p>
        <div
          className="rounded-xl p-4"
          style={{
            background: `hsl(${background})`,
            color: `hsl(${foreground})`,
            borderRadius: radius,
          }}
        >
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{
              background: `hsl(${primary})`,
              color: "white",
              borderRadius: radius,
            }}
          >
            Primary button
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex gap-3 items-center">
        <Submit />
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Open storefront →
        </a>
      </div>
    </form>
  );
}


"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { SiteImageKey } from "@/lib/site-assets";
import { SITE_IMAGE_KEYS } from "@/lib/site-assets";
import { useAdminFormToast } from "@/hooks/use-admin-form-toast";
import type { SiteImagesFormState } from "./actions";
import { CmsImageUrlField } from "./cms-image-url-field";

const LABELS: Record<SiteImageKey, string> = {
  "hero-desktop": "Hero — desktop (wide)",
  "hero-mobile": "Hero — mobile / small screens",
  "dress-style-1": "Browse by style — card 1 (Casual)",
  "dress-style-2": "Browse by style — card 2 (Formal)",
  "dress-style-3": "Browse by style — card 3 (Party)",
  "dress-style-4": "Browse by style — card 4 (Gym)",
};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-slate-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save all"}
    </button>
  );
}

type Props = {
  action: (prev: SiteImagesFormState, formData: FormData) => Promise<SiteImagesFormState>;
  initialState: SiteImagesFormState;
  defaults: Record<SiteImageKey, string>;
};

export function SiteImagesForm({ action, initialState, defaults }: Props) {
  const [state, formAction] = useFormState(action, initialState);
  useAdminFormToast(state, { successMessage: "Site images saved" });

  return (
    <form action={formAction} className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {state.error && (
        <div className="rounded-lg bg-red-50 text-red-800 text-sm px-4 py-3">{state.error}</div>
      )}

      {SITE_IMAGE_KEYS.map((key) => (
        <CmsImageUrlField
          key={key}
          id={key}
          name={`asset-${key}`}
          label={LABELS[key]}
          defaultValue={defaults[key]}
        />
      ))}

      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-500 mb-3">
          To restore defaults, clear a field (delete the URL text) and click Save all.
        </p>
        <Submit />
      </div>
    </form>
  );
}

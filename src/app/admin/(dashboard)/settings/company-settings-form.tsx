"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import type { CompanySettings } from "@prisma/client";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAdminFormToast } from "@/hooks/use-admin-form-toast";
import type { CompanySettingsFormState } from "./actions";
import { updateCompanySettings } from "./actions";
import { CompanySettingsCurrencyFields } from "./company-settings-currency-fields";

function ImageUrlRow({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [ok, setOk] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const show = url.trim().length > 0 && (url.startsWith("/") || /^https?:\/\//i.test(url));

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("prefix", "site");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = typeof data.error === "string" ? data.error : "Upload failed";
        setMsg(err);
        toast.error(err);
        return;
      }
      if (data.url) {
        setUrl(data.url);
        setOk(true);
        setMsg("Uploaded");
        toast.success("Image uploaded");
      }
    } catch {
      setMsg("Upload failed");
      toast.error("Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {show ? (
            ok ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url.trim()}
                alt=""
                className="h-full w-full object-contain object-center"
                onError={() => setOk(false)}
                onLoad={() => setOk(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-1 text-center text-[10px] text-amber-800">
                Bad URL
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-slate-400">—</div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <input
            name={name}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setOk(true);
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              className="text-xs file:mr-2 file:rounded file:border-0 file:bg-slate-200 file:px-2 file:py-1"
              disabled={busy}
              onChange={onFile}
            />
            {busy && <span className="text-xs text-slate-500">Uploading…</span>}
            {msg && <span className="text-xs text-emerald-700">{msg}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-slate-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save settings"}
    </button>
  );
}

type Props = {
  settings: CompanySettings;
  action: typeof updateCompanySettings;
};

export function CompanySettingsForm({ settings, action }: Props) {
  const initial: CompanySettingsFormState = {};
  const [state, formAction] = useFormState(action, initial);
  useAdminFormToast(state, { successMessage: "Company settings saved" });

  const s = settings;

  return (
    <form action={formAction} className="space-y-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {state.error && (
        <div className="rounded-lg bg-red-50 text-red-800 text-sm px-4 py-3">{state.error}</div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">Company</h2>
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">
            Company name *
          </label>
          <input
            id="companyName"
            name="companyName"
            required
            defaultValue={s.companyName}
            className="w-full max-w-xl rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="legalName" className="block text-sm font-medium text-slate-700 mb-1">
            Legal / registered name
          </label>
          <input
            id="legalName"
            name="legalName"
            defaultValue={s.legalName ?? ""}
            className="w-full max-w-xl rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="supportEmail" className="block text-sm font-medium text-slate-700 mb-1">
            Support email
          </label>
          <input
            id="supportEmail"
            name="supportEmail"
            type="email"
            defaultValue={s.supportEmail ?? ""}
            className="w-full max-w-xl rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <ImageUrlRow name="logoUrl" label="Logo URL" defaultValue={s.logoUrl ?? ""} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">
          Site metadata (SEO)
        </h2>
        <div>
          <label htmlFor="metaTitle" className="block text-sm font-medium text-slate-700 mb-1">
            Default meta title
          </label>
          <input
            id="metaTitle"
            name="metaTitle"
            defaultValue={s.metaTitle ?? ""}
            className="w-full max-w-xl rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="metaDescription" className="block text-sm font-medium text-slate-700 mb-1">
            Meta description
          </label>
          <textarea
            id="metaDescription"
            name="metaDescription"
            rows={3}
            defaultValue={s.metaDescription ?? ""}
            className="w-full max-w-2xl rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <ImageUrlRow name="ogImageUrl" label="Open Graph image URL" defaultValue={s.ogImageUrl ?? ""} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">Currency</h2>
        <CompanySettingsCurrencyFields settings={s} />
        <p className="text-xs text-slate-500">
          Storefront can read these via <code className="bg-slate-100 px-1 rounded">/api/company-settings</code>{" "}
          (same database). Configure payment methods under{" "}
          <Link href="/admin/settings/payment" className="text-indigo-600 hover:underline">
            Payment settings
          </Link>
          .
        </p>
      </section>

      <div className="pt-2 border-t border-slate-100">
        <Submit />
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { toast } from "react-toastify";

type Props = {
  name: string;
  id: string;
  defaultValue: string;
  label: string;
  hint?: string;
};

function isLikelyImageUrl(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  if (t.startsWith("data:image/")) return true;
  if (t.startsWith("/")) return true;
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function CmsImageUrlField({ name, id, defaultValue, label, hint }: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [previewOk, setPreviewOk] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const showPreview = isLikelyImageUrl(url);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("prefix", "site");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = typeof data.error === "string" ? data.error : "Upload failed";
        setMsg(err);
        toast.error(err);
        return;
      }
      if (data.url) {
        setUrl(data.url);
        setPreviewOk(true);
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
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="shrink-0 w-full sm:w-[200px] sm:max-w-[40%]">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {showPreview ? (
              previewOk ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url.trim()}
                  alt=""
                  className="h-full w-full object-cover object-center"
                  onLoad={() => setPreviewOk(true)}
                  onError={() => setPreviewOk(false)}
                />
              ) : (
                <div className="flex h-full min-h-[120px] items-center justify-center p-2 text-center text-xs text-amber-800">
                  Could not load preview (check URL or CORS).
                </div>
              )
            ) : (
              <div className="flex h-full min-h-[120px] items-center justify-center p-2 text-center text-xs text-slate-500">
                No preview — enter a URL or upload
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            id={id}
            name={name}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setPreviewOk(true);
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
          {hint && <p className="text-xs text-slate-500">{hint}</p>}
        </div>
      </div>
    </div>
  );
}

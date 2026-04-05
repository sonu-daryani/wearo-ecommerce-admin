"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  name?: string;
  defaultValue: string;
};

export function ProductSrcUrlField({ name = "srcUrl", defaultValue }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("prefix", "products");
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
      if (data.url && inputRef.current) {
        inputRef.current.value = data.url;
        setMsg("Uploaded to R2");
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
      <label htmlFor="srcUrl" className="block text-sm font-medium text-slate-700">
        Main image URL *
      </label>
      <input
        ref={inputRef}
        id="srcUrl"
        name={name}
        key={defaultValue}
        defaultValue={defaultValue}
        required
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
      />
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-slate-600">
          <span className="sr-only">Upload image</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="text-xs file:mr-2 file:rounded file:border-0 file:bg-slate-200 file:px-2 file:py-1"
            disabled={busy}
            onChange={onFile}
          />
        </label>
        {busy && <span className="text-xs text-slate-500">Uploading…</span>}
        {msg && <span className="text-xs text-emerald-700">{msg}</span>}
      </div>
      <p className="text-xs text-slate-500">
        Paste a URL or upload — files go to your R2 bucket (configure R2_* env).
      </p>
    </div>
  );
}

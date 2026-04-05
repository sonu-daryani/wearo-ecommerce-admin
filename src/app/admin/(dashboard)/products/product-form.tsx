"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useAdminFormToast } from "@/hooks/use-admin-form-toast";
import type { ProductFormState } from "./actions";
import { ProductSrcUrlField } from "./product-src-url-field";

type ProductValues = {
  id: number;
  slug: string;
  title: string;
  srcUrl: string;
  gallery: string[];
  price: number;
  discountAmount: number;
  discountPercentage: number;
  rating: number;
  sectionNewArrival: boolean;
  sectionTopSelling: boolean;
  sectionRelated: boolean;
  published: boolean;
};

type Props = {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  initialState: ProductFormState;
  mode: "create" | "edit";
  product?: ProductValues;
};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-slate-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function ProductForm({ action, initialState, mode, product }: Props) {
  const [state, formAction] = useFormState(action, initialState);
  useAdminFormToast(state, {
    successMessage: mode === "create" ? "Product created" : "Product saved",
  });
  const p = product;

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {state.error && (
        <div className="rounded-lg bg-red-50 text-red-800 text-sm px-4 py-3">{state.error}</div>
      )}

      {mode === "edit" && p && <input type="hidden" name="id" value={p.id} />}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
          Title *
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={p?.title ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">
          Slug (optional; auto from title)
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={p?.slug ?? ""}
          placeholder="e.g. striped-shirt"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
        />
      </div>

      <ProductSrcUrlField defaultValue={p?.srcUrl ?? ""} />

      <div>
        <label htmlFor="gallery" className="block text-sm font-medium text-slate-700 mb-1">
          Gallery URLs (one per line)
        </label>
        <textarea
          id="gallery"
          name="gallery"
          rows={4}
          defaultValue={p?.gallery?.join("\n") ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">
            Price (USD) *
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={p?.price ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-slate-700 mb-1">
            Rating (0–5)
          </label>
          <input
            id="rating"
            name="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            defaultValue={p?.rating ?? 0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="discountAmount" className="block text-sm font-medium text-slate-700 mb-1">
            Discount amount ($)
          </label>
          <input
            id="discountAmount"
            name="discountAmount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={p?.discountAmount ?? 0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="discountPercentage" className="block text-sm font-medium text-slate-700 mb-1">
            Discount %
          </label>
          <input
            id="discountPercentage"
            name="discountPercentage"
            type="number"
            step="1"
            min="0"
            max="100"
            defaultValue={p?.discountPercentage ?? 0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700 mb-2">Sections</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="sectionNewArrival" defaultChecked={p?.sectionNewArrival} />
          New arrivals
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="sectionTopSelling" defaultChecked={p?.sectionTopSelling} />
          Top selling
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="sectionRelated" defaultChecked={p?.sectionRelated} />
          Related pool (for product page)
        </label>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={p?.published ?? true} />
        Published (visible on storefront)
      </label>

      <div className="pt-2">
        <Submit label={mode === "create" ? "Create product" : "Save changes"} />
      </div>
    </form>
  );
}

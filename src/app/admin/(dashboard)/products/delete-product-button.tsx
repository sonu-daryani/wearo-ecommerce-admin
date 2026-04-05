"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useAdminFormToast } from "@/hooks/use-admin-form-toast";
import { deleteProduct, type ProductFormState } from "./actions";
import { useState } from "react";

const initial: ProductFormState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-red-600 font-medium hover:underline disabled:opacity-50 text-xs"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}

export function DeleteProductButton({ id }: { id: number }) {
  const [state, action] = useFormState(deleteProduct, initial);
  useAdminFormToast(state, { successMessage: "Product deleted" });
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-red-600 font-medium hover:underline text-xs"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <form action={action} className="flex items-center gap-2">
        <input type="hidden" name="id" value={id} />
        <button type="button" onClick={() => setOpen(false)} className="text-slate-500 text-xs">
          Cancel
        </button>
        <Submit />
      </form>
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
    </span>
  );
}

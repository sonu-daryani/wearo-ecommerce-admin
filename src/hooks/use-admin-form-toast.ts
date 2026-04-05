"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type AdminFormToastState = {
  error?: string;
  toastAt?: number;
  redirectTo?: string;
};

/** Server action state: error toast; each new `toastAt` shows success and optional client `redirectTo`. */
export function useAdminFormToast(
  state: AdminFormToastState | undefined,
  options?: { successMessage?: string }
) {
  const router = useRouter();
  const lastErr = useRef<string | undefined>(undefined);
  const lastToastAt = useRef<number>(0);

  useEffect(() => {
    const err = state?.error;
    if (err && err !== lastErr.current) {
      lastErr.current = err;
      toast.error(err);
    }
    if (!err) lastErr.current = undefined;
  }, [state?.error]);

  useEffect(() => {
    const at = state?.toastAt;
    if (at && at !== lastToastAt.current) {
      lastToastAt.current = at;
      toast.success(options?.successMessage ?? "Saved successfully");
      if (state?.redirectTo) {
        router.push(state.redirectTo);
      }
    }
  }, [state?.toastAt, state?.redirectTo, router, options?.successMessage]);
}

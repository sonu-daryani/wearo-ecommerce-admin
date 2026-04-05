"use client";

import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import { ToastProvider } from "@/components/ui/toast-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthSessionProvider>
  );
}

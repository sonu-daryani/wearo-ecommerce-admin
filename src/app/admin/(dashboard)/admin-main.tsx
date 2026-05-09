"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
};

/** Dashboard content area: editor uses full main column width; other pages stay readable. */
export function AdminMain({ children }: Props) {
  const pathname = usePathname() ?? "";
  const editorFullWidth = pathname.startsWith("/admin/editor");

  return (
    <main
      className={cn(
        "flex-1 w-full min-w-0",
        editorFullWidth ? "p-2 sm:p-3 md:p-4" : "mx-auto max-w-6xl p-4 md:p-8"
      )}
    >
      {children}
    </main>
  );
}

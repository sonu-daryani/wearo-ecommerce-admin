"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import type { ComponentProps, ReactNode } from "react";

/** Must match `pages.signIn` in `auth.ts` — always land here after sign-out (never current URL). */
const ADMIN_SIGN_IN_PATH = "/auth/login";

type Props = {
  className?: string;
  size?: ComponentProps<typeof Button>["size"];
  variant?: ComponentProps<typeof Button>["variant"];
  children?: ReactNode;
};

export default function SignOutButton({
  className,
  size = "default",
  variant = "outline",
  children,
}: Props) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={() => signOut({ redirectTo: ADMIN_SIGN_IN_PATH })}
    >
      {children ?? "Sign out"}
    </Button>
  );
}

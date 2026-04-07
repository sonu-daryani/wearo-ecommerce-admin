"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import type { ComponentProps } from "react";

type Props = {
  callbackUrl?: string;
  className?: string;
  size?: ComponentProps<typeof Button>["size"];
  variant?: ComponentProps<typeof Button>["variant"];
};

export default function SignOutButton({
  callbackUrl = "/auth/login",
  className,
  size = "default",
  variant = "outline",
}: Props) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={() => signOut({ callbackUrl })}
    >
      Sign out
    </Button>
  );
}

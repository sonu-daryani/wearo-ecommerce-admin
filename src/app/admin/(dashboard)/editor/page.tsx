import { auth } from "@/auth";
import { getCompanySettings } from "@/lib/company-settings";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import EditorShell from "./shell";

export const metadata = {
  title: "Storefront editor",
  robots: { index: false, follow: false },
};

export default async function StorefrontEditorPage() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!session?.user?.id || !can(role, "cms:write")) {
    redirect("/admin/forbidden");
  }

  const row = await getCompanySettings();
  const storefrontUrl =
    process.env.NEXT_PUBLIC_STOREFRONT_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const rawTheme = (row as unknown as { theme?: unknown }).theme;
  const theme =
    rawTheme && typeof rawTheme === "object" && !Array.isArray(rawTheme)
      ? (rawTheme as Record<string, string>)
      : {};

  return <EditorShell storefrontUrl={storefrontUrl} initialTheme={theme} />;
}


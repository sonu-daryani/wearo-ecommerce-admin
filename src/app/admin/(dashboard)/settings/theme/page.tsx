import Link from "next/link";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCompanySettings } from "@/lib/company-settings";
import { ThemeSettingsForm } from "./theme-settings-form";

export const metadata = {
  title: "Theme editor",
  robots: { index: false, follow: false },
};

export default async function ThemeEditorPage() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!session?.user?.id || !can(role, "cms:write")) {
    redirect("/admin/forbidden");
  }

  const settings = await getCompanySettings();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/settings" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
          ← Company settings
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Theme editor</h1>
        <p className="text-sm text-slate-600 mt-1">
          Update storefront colors, radius, and styling tokens. Changes apply via CSS variables globally (Shopify-like).
        </p>
      </div>

      <ThemeSettingsForm settings={settings} />
    </div>
  );
}


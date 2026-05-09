import Link from "next/link";
import { auth } from "@/auth";
import { AdminPageHeader } from "@/components/admin/admin-page";
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
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <AdminPageHeader
        backHref="/admin/settings"
        backLabel="Company settings"
        title="Theme editor"
        description={
          <>
            Storefront colors, radius, and CSS variables — similar to Shopify theme settings. Changes
            apply globally on the shop.
          </>
        }
      />

      <ThemeSettingsForm settings={settings} />
    </div>
  );
}

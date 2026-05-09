import Link from "next/link";
import { auth } from "@/auth";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-page";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCompanySettings } from "@/lib/company-settings";
import { CompanySettingsForm } from "./company-settings-form";
import { updateCompanySettings } from "./actions";

export const metadata = {
  title: "Company settings",
  robots: { index: false, follow: false },
};

export default async function CompanySettingsPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  if (!can(role, "cms:read")) {
    redirect("/admin/forbidden");
  }

  const settings = await getCompanySettings();

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <AdminPageHeader
        backHref="/admin"
        backLabel="Dashboard"
        title="Company settings"
        description={
          <>
            Branding, SEO defaults, and currency.{" "}
            {can(role, "cms:write") && (
              <>
                <Link href="/admin/settings/theme" className="font-medium text-primary hover:underline">
                  Theme editor
                </Link>
                {" · "}
                <Link
                  href="/admin/settings/payment"
                  className="font-medium text-primary hover:underline"
                >
                  Payment settings
                </Link>
              </>
            )}{" "}
            are separate screens.
          </>
        }
      />

      {can(role, "cms:write") ? (
        <CompanySettingsForm settings={settings} action={updateCompanySettings} />
      ) : (
        <AdminPanel padded>
          <p className="text-sm text-slate-700">
            <span className="font-medium text-slate-900">Company:</span> {settings.companyName}
          </p>
          <p className="mt-3 text-sm text-slate-700">
            <span className="font-medium text-slate-900">Currency:</span> {settings.currencySymbol}{" "}
            {settings.currencyCode} · {settings.currencyLocale}
          </p>
          <p className="mt-4 text-xs text-slate-500">
            You need CMS edit access to change these fields.
          </p>
        </AdminPanel>
      )}
    </div>
  );
}

import Link from "next/link";
import { auth } from "@/auth";
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
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-primary hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Company settings</h1>
        <p className="text-sm text-slate-600 mt-1">
          Branding, SEO defaults, and currency display.{" "}
          {can(role, "cms:write") && (
            <>
              <Link href="/admin/settings/theme" className="text-indigo-600 font-medium hover:underline">
                Theme editor
              </Link>
              {" · "}
              <Link href="/admin/settings/payment" className="text-indigo-600 font-medium hover:underline">
                Payment settings
              </Link>
            </>
          )}{" "}
          are configured separately.
        </p>
      </div>

      {can(role, "cms:write") ? (
        <CompanySettingsForm settings={settings} action={updateCompanySettings} />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 space-y-2">
          <p>
            <span className="font-medium text-slate-800">Company:</span> {settings.companyName}
          </p>
          <p>
            <span className="font-medium text-slate-800">Currency:</span> {settings.currencySymbol}{" "}
            {settings.currencyCode} · {settings.currencyLocale}
          </p>
          <p className="text-xs text-slate-500">You need CMS write access to edit these settings.</p>
        </div>
      )}
    </div>
  );
}

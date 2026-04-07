import Link from "next/link";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { getCompanySettings } from "@/lib/company-settings";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { PaymentSettingsForm } from "./payment-settings-form";
import { updatePaymentSettings } from "./actions";

export const metadata = {
  title: "Payment settings",
  robots: { index: false, follow: false },
};

export default async function PaymentSettingsPage() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!session?.user?.id || !can(role, "cms:write")) {
    redirect("/admin/forbidden");
  }

  const row = await getCompanySettings();
  const {
    cashfreeClientSecret: _cf,
    razorpayKeySecret: _rzp,
    paytmMerchantKey: _ptm,
    phonepeSaltKey: _pps,
    payuMerchantKey: _puk,
    payuSalt: _pus,
    ...settingsBase
  } = row;
  const settings = {
    ...settingsBase,
    cashfreeSecretOnFile: !!row.cashfreeClientSecret?.trim(),
    razorpaySecretOnFile: !!row.razorpayKeySecret?.trim(),
    paytmMerchantKeyOnFile: !!row.paytmMerchantKey?.trim(),
    phonepeSaltKeyOnFile: !!row.phonepeSaltKey?.trim(),
    payuMerchantKeyOnFile: !!row.payuMerchantKey?.trim(),
    payuSaltOnFile: !!row.payuSalt?.trim(),
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/settings"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Company settings
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Payment settings</h1>
        <p className="text-sm text-slate-600 mt-1">
          Control checkout payment types. Publishable keys and API secrets are saved in the database and used only on
          the server (never sent to the browser). The storefront reads the same database for payment APIs.
        </p>
      </div>
      <PaymentSettingsForm
        key={row.updatedAt.toISOString()}
        settings={settings}
        action={updatePaymentSettings}
      />
    </div>
  );
}

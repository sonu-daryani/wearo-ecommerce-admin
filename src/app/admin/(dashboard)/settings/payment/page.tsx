import Link from "next/link";
import { auth } from "@/auth";
import { AdminPageHeader } from "@/components/admin/admin-page";
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
    <div className="space-y-8 pb-8">
      <AdminPageHeader
        backHref="/admin/settings"
        backLabel="Company settings"
        title="Payment settings"
        description={
          <>
            Checkout methods and gateways. Secrets are stored in the database and used only on the
            server — never exposed to the browser.
          </>
        }
      />
      <PaymentSettingsForm
        key={row.updatedAt.toISOString()}
        settings={settings}
        action={updatePaymentSettings}
      />
    </div>
  );
}

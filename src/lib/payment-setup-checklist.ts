import type { CompanySettings } from "@prisma/client";

export type PaymentChecklistItem = {
  id: string;
  label: string;
  description: string;
  done: boolean;
  href?: string;
};

export type PaymentSetupSummary = {
  items: PaymentChecklistItem[];
  completedCount: number;
  totalCount: number;
};

type ChecklistInput = Pick<
  CompanySettings,
  | "companyName"
  | "currencyCode"
  | "supportEmail"
  | "payCod"
  | "payOnlineEnabled"
  | "payTypeCodSelected"
  | "payTypeOnlineSelected"
  | "onlineProviders"
  | "cashfreeAppId"
  | "cashfreeClientSecret"
  | "paytmMerchantId"
  | "paytmMerchantKey"
  | "phonepeMerchantId"
  | "phonepeSaltKey"
  | "payuMerchantKey"
  | "payuSalt"
>;

export function getPaymentSetupChecklist(settings: ChecklistInput): PaymentSetupSummary {
  const hasCashfree = settings.onlineProviders.includes("CASHFREE");
  const hasPaytm = settings.onlineProviders.includes("PAYTM");
  const hasPhonepe = settings.onlineProviders.includes("PHONEPE");
  const hasPayu = settings.onlineProviders.includes("PAYU");

  const cashfreeReady =
    !hasCashfree ||
    (!!settings.cashfreeAppId?.trim() && !!settings.cashfreeClientSecret?.trim());
  const paytmReady = !hasPaytm || !!(settings.paytmMerchantId?.trim() && settings.paytmMerchantKey?.trim());
  const phonepeReady = !hasPhonepe || !!(settings.phonepeMerchantId?.trim() && settings.phonepeSaltKey?.trim());
  const payuReady = !hasPayu || !!(settings.payuMerchantKey?.trim() && settings.payuSalt?.trim());
  const providerKeysOk = cashfreeReady && paytmReady && phonepeReady && payuReady;

  const codOk = !settings.payTypeCodSelected || settings.payCod === true;
  const onlineFlowOk =
    !settings.payTypeOnlineSelected ||
    (settings.payOnlineEnabled === true &&
      settings.onlineProviders.length > 0 &&
      providerKeysOk);

  const items: PaymentChecklistItem[] = [
    {
      id: "company",
      label: "Company profile",
      description: "Business name and support contact for receipts and customer emails.",
      done: !!settings.companyName?.trim() && !!settings.supportEmail?.trim(),
      href: "/admin/settings",
    },
    {
      id: "currency",
      label: "Currency & display",
      description: "Confirm currency code and symbol match how you price products at checkout.",
      done: !!settings.currencyCode?.trim(),
      href: "/admin/settings",
    },
    {
      id: "cod",
      label: "Cash on delivery",
      description: "If COD is shown in admin, turn it on for customers who pay on delivery.",
      done: codOk,
      href: "/admin/settings/payment",
    },
    {
      id: "online",
      label: "Online payments",
      description: "Enable online checkout and add at least one provider with live keys.",
      done: onlineFlowOk,
      href: "/admin/settings/payment",
    },
    {
      id: "provider-keys",
      label: "Provider credentials",
      description: "Each selected gateway needs publishable/app ID plus secret stored server-side.",
      done: providerKeysOk,
      href: "/admin/settings/payment",
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  return {
    items,
    completedCount,
    totalCount: items.length,
  };
}

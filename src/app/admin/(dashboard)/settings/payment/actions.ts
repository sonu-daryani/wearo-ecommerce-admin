"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { COMPANY_SETTINGS_KEY, getCompanySettings } from "@/lib/company-settings";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type PaymentSettingsFormState = {
  error?: string;
  toastAt?: number;
};

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t ? t : null;
}

function parseProviders(formData: FormData): string[] {
  const allowed = new Set(["STRIPE", "RAZORPAY", "CASHFREE"]);
  const raw = formData.getAll("onlineProviders").map(String);
  return Array.from(new Set(raw.filter((x) => allowed.has(x))));
}

export async function updatePaymentSettings(
  _prev: PaymentSettingsFormState,
  formData: FormData
): Promise<PaymentSettingsFormState> {
  const session = await auth();
  if (!session?.user?.id || !can(session.user.role, "cms:write")) {
    return { error: "You do not have permission to change payment settings." };
  }

  await getCompanySettings();

  const codFeeFlat = Number(formData.get("codFeeFlat") ?? 0) || 0;
  const codFeePercent = Number(formData.get("codFeePercent") ?? 0) || 0;
  if (codFeeFlat < 0 || codFeePercent < 0 || codFeePercent > 100) {
    return { error: "Invalid COD fee values." };
  }

  const waiveRaw = String(formData.get("codWaiveFeeAboveAmount") ?? "").trim();
  const codWaiveFeeAboveAmount =
    waiveRaw === "" ? null : Number(waiveRaw);
  if (codWaiveFeeAboveAmount !== null && (!Number.isFinite(codWaiveFeeAboveAmount) || codWaiveFeeAboveAmount < 0)) {
    return { error: "Invalid waive-above amount." };
  }

  const data: Prisma.CompanySettingsUpdateInput = {
    payTypeCodSelected: formData.get("payTypeCodSelected") === "on",
    payTypeOnlineSelected: formData.get("payTypeOnlineSelected") === "on",
    payCod: formData.get("payCod") === "on",
    payOnlineEnabled: formData.get("payOnlineEnabled") === "on",
    codFeeFlat,
    codFeePercent,
    codWaiveFeeAboveAmount,
    payUpi: formData.get("payUpi") === "on",
    payCard: formData.get("payCard") === "on",
    payWallet: formData.get("payWallet") === "on",
    payNetBanking: formData.get("payNetBanking") === "on",
    onlineProviders: parseProviders(formData),
    stripePublishableKey: emptyToNull(String(formData.get("stripePublishableKey") ?? "")),
    razorpayKeyId: emptyToNull(String(formData.get("razorpayKeyId") ?? "")),
    cashfreeAppId: emptyToNull(String(formData.get("cashfreeAppId") ?? "")),
    paymentInstructions: emptyToNull(String(formData.get("paymentInstructions") ?? "")),
  };

  const applySecret = (
    inputName: string,
    clearName: string,
    field: "stripeSecretKey" | "razorpayKeySecret" | "cashfreeClientSecret"
  ) => {
    if (formData.get(clearName) === "on") {
      data[field] = null;
      return;
    }
    const plain = String(formData.get(inputName) ?? "").trim();
    if (plain) data[field] = plain;
  };

  applySecret("stripeSecret", "clearStripeSecret", "stripeSecretKey");
  applySecret("razorpaySecret", "clearRazorpaySecret", "razorpayKeySecret");
  applySecret("cashfreeSecret", "clearCashfreeSecret", "cashfreeClientSecret");

  try {
    await prisma.companySettings.update({
      where: { key: COMPANY_SETTINGS_KEY },
      data,
    });
  } catch {
    return { error: "Could not save payment settings." };
  }

  revalidatePath("/admin/settings/payment");
  revalidatePath("/admin/settings");
  return { toastAt: Date.now() };
}

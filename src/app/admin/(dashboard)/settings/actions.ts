"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { COMPANY_SETTINGS_KEY } from "@/lib/company-settings";
import { revalidatePath } from "next/cache";

export type CompanySettingsFormState = {
  error?: string;
  toastAt?: number;
  redirectTo?: string;
};

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t ? t : null;
}

export async function updateCompanySettings(
  _prev: CompanySettingsFormState,
  formData: FormData
): Promise<CompanySettingsFormState> {
  const session = await auth();
  if (!session?.user?.id || !can(session.user.role, "cms:write")) {
    return { error: "You do not have permission to change company settings." };
  }

  const companyName = String(formData.get("companyName") ?? "").trim();
  if (!companyName) {
    return { error: "Company name is required." };
  }

  const decimalPlaces = Math.min(
    4,
    Math.max(0, Math.floor(Number(formData.get("currencyDecimalPlaces") ?? 2)))
  );
  if (!Number.isFinite(decimalPlaces)) {
    return { error: "Invalid decimal places." };
  }

  const currencyCode = String(formData.get("currencyCode") ?? "INR")
    .trim()
    .toUpperCase()
    .slice(0, 8);
  const currencySymbol = String(formData.get("currencySymbol") ?? "₹").trim().slice(0, 8);
  const currencyLocale = String(formData.get("currencyLocale") ?? "en-IN").trim().slice(0, 32);

  try {
    await prisma.companySettings.upsert({
      where: { key: COMPANY_SETTINGS_KEY },
      create: {
        key: COMPANY_SETTINGS_KEY,
        companyName,
        legalName: emptyToNull(String(formData.get("legalName") ?? "")),
        supportEmail: emptyToNull(String(formData.get("supportEmail") ?? "")),
        logoUrl: emptyToNull(String(formData.get("logoUrl") ?? "")),
        metaTitle: emptyToNull(String(formData.get("metaTitle") ?? "")),
        metaDescription: emptyToNull(String(formData.get("metaDescription") ?? "")),
        ogImageUrl: emptyToNull(String(formData.get("ogImageUrl") ?? "")),
        currencyCode: currencyCode || "INR",
        currencySymbol: currencySymbol || "₹",
        currencyLocale: currencyLocale || "en-IN",
        currencyDecimalPlaces: decimalPlaces,
      },
      update: {
        companyName,
        legalName: emptyToNull(String(formData.get("legalName") ?? "")),
        supportEmail: emptyToNull(String(formData.get("supportEmail") ?? "")),
        logoUrl: emptyToNull(String(formData.get("logoUrl") ?? "")),
        metaTitle: emptyToNull(String(formData.get("metaTitle") ?? "")),
        metaDescription: emptyToNull(String(formData.get("metaDescription") ?? "")),
        ogImageUrl: emptyToNull(String(formData.get("ogImageUrl") ?? "")),
        currencyCode: currencyCode || "INR",
        currencySymbol: currencySymbol || "₹",
        currencyLocale: currencyLocale || "en-IN",
        currencyDecimalPlaces: decimalPlaces,
      },
    });
  } catch {
    return { error: "Could not save settings." };
  }

  revalidatePath("/admin/settings");
  return { toastAt: Date.now() };
}

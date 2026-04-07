"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { COMPANY_SETTINGS_KEY, getCompanySettings } from "@/lib/company-settings";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";
import { STOREFRONT_THEME_TOKEN_KEYS } from "@/lib/storefront-theme-tokens";
import { revalidatePath } from "next/cache";

export type ThemeSettingsFormState = {
  error?: string;
  toastAt?: number;
};

export async function updateThemeSettings(
  _prev: ThemeSettingsFormState,
  formData: FormData
): Promise<ThemeSettingsFormState> {
  const session = await auth();
  if (!session?.user?.id || !can(session.user.role, "cms:write")) {
    return { error: "You do not have permission to change theme settings." };
  }

  const row = await getCompanySettings();
  const prevRaw = (row as unknown as { theme?: unknown }).theme;
  const prev =
    prevRaw && typeof prevRaw === "object" && !Array.isArray(prevRaw)
      ? { ...(prevRaw as Record<string, string>) }
      : {};

  const next: Record<string, string> = { ...prev };

  for (const k of STOREFRONT_THEME_TOKEN_KEYS) {
    const raw = String(formData.get(k) ?? "").trim();
    if (raw) next[k] = raw;
  }

  for (const [rawKey, rawVal] of Array.from(formData.entries())) {
    if (typeof rawVal !== "string") continue;
    if (!rawKey.startsWith("content.")) continue;
    const key = rawKey.trim();
    const value = rawVal.trim();
    if (!key) continue;
    if (value) next[key] = sanitizeRichHtml(value);
    else delete next[key];
  }

  try {
    await prisma.companySettings.update({
      where: { key: COMPANY_SETTINGS_KEY },
      data: { theme: next },
    });
  } catch (e) {
    console.error("updateThemeSettings failed", e);
    return { error: "Could not save theme settings." };
  }

  revalidatePath("/admin/settings/theme");
  revalidatePath("/admin/editor");
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { toastAt: Date.now() };
}


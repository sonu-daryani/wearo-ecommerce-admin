"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { SITE_IMAGE_KEYS } from "@/lib/site-assets";
import { revalidatePath } from "next/cache";
export type SiteImagesFormState = {
  error?: string;
  toastAt?: number;
  redirectTo?: string;
};

export async function updateSiteImages(
  _prev: SiteImagesFormState,
  formData: FormData
): Promise<SiteImagesFormState> {
  const session = await auth();
  if (!session?.user?.id || !can(session.user.role, "cms:write")) {
    return { error: "You do not have permission to edit site images." };
  }

  try {
    for (const key of SITE_IMAGE_KEYS) {
      const raw = String(formData.get(`asset-${key}`) ?? "").trim();
      if (!raw) {
        await prisma.cmsSiteAsset.deleteMany({ where: { key } });
        continue;
      }
      await prisma.cmsSiteAsset.upsert({
        where: { key },
        create: { key, imageUrl: raw },
        update: { imageUrl: raw },
      });
    }
  } catch {
    return { error: "Could not save site images." };
  }

  revalidatePath("/");
  revalidatePath("/admin/cms/site-images");
  return { toastAt: Date.now() };
}

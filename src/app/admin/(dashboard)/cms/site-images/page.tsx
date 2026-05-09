import { auth } from "@/auth";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-page";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  SITE_IMAGE_KEYS,
  defaultSiteImageUrl,
  type SiteImageKey,
} from "@/lib/site-assets";
import { updateSiteImages, type SiteImagesFormState } from "./actions";
import { SiteImagesForm } from "./site-images-form";

export const metadata = {
  title: "Site images",
  robots: { index: false, follow: false },
};

const LABELS: Record<SiteImageKey, string> = {
  "hero-desktop": "Hero — desktop (wide)",
  "hero-mobile": "Hero — mobile / small screens",
  "dress-style-1": "Browse by style — card 1 (Casual)",
  "dress-style-2": "Browse by style — card 2 (Formal)",
  "dress-style-3": "Browse by style — card 3 (Party)",
  "dress-style-4": "Browse by style — card 4 (Gym)",
};

const initial: SiteImagesFormState = {};

export default async function SiteImagesPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  if (!can(role, "cms:read")) {
    redirect("/admin/forbidden");
  }

  const rows = await prisma.cmsSiteAsset.findMany({
    where: { key: { in: [...SITE_IMAGE_KEYS] } },
  });
  const fromDb = new Map(rows.map((r) => [r.key, r.imageUrl]));

  const defaults: Record<SiteImageKey, string> = {} as Record<SiteImageKey, string>;
  for (const k of SITE_IMAGE_KEYS) {
    defaults[k] = fromDb.get(k) ?? defaultSiteImageUrl(k);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <AdminPageHeader
        backHref="/admin/cms"
        backLabel="CMS documents"
        title="Site images"
        description={
          <>
            Hero and “browse by style” backgrounds. Saving empty fields resets to{" "}
            <code className="rounded bg-slate-100 px-1 text-xs">/public/images</code> defaults.
            Uploads use R2 under <code className="rounded bg-slate-100 px-1 text-xs">site/</code>.
          </>
        }
      />

      {can(role, "cms:write") ? (
        <SiteImagesForm action={updateSiteImages} initialState={initial} defaults={defaults} />
      ) : (
        <AdminPanel padded>
          <ul className="space-y-4 text-sm">
          {SITE_IMAGE_KEYS.map((k) => (
            <li key={k} className="flex gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={defaults[k]}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="min-w-0">
                <span className="font-medium text-slate-800">{LABELS[k]}</span>
                <div className="font-mono text-xs text-slate-600 break-all mt-1">{defaults[k]}</div>
              </div>
            </li>
          ))}
          </ul>
        </AdminPanel>
      )}
    </div>
  );
}

import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  adminBtnSecondary,
  AdminPanel,
  AdminTableThead,
} from "@/components/admin/admin-page";
import {
  CMS_STOREFRONT_PAGE_GROUPS,
  flattenCmsStorefrontPages,
} from "@/lib/cms-storefront-pages";
import { auth } from "@/auth";
import { canCreateCms, canEditCms } from "@/lib/rbac";
import type { Role } from "@prisma/client";

function storefrontOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_STOREFRONT_URL?.trim().replace(/\/$/, "");
  return raw || "http://localhost:3000";
}

export async function StorefrontPagesPanel() {
  const session = await auth();
  const role = session?.user?.role as Role;
  const canCreate = canCreateCms(role);
  const canEdit = canEditCms(role);

  const slugs = flattenCmsStorefrontPages().map((p) => p.slug);
  const docs = await prisma.cmsDocument.findMany({
    where: { slug: { in: [...slugs] } },
    select: {
      id: true,
      slug: true,
      title: true,
      published: true,
      updatedAt: true,
    },
  });
  const bySlug = new Map(docs.map((d) => [d.slug, d]));
  const origin = storefrontOrigin();

  return (
    <div className="space-y-6">
      {CMS_STOREFRONT_PAGE_GROUPS.map((group) => (
        <AdminPanel key={group.title} padded>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{group.title}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Use these slugs so content lines up with{" "}
                <span className="font-mono text-xs">/api/cms/public/[slug]</span> on the storefront.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left text-sm">
              <AdminTableThead>
                <tr>
                  <th className="px-3 py-2.5 font-medium">Page</th>
                  <th className="px-3 py-2.5 font-medium">CMS slug</th>
                  <th className="px-3 py-2.5 font-medium">Storefront</th>
                  <th className="px-3 py-2.5 font-medium">In CMS</th>
                  <th className="px-3 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </AdminTableThead>
              <tbody className="divide-y divide-slate-100">
                {group.pages.map((p) => {
                  const doc = bySlug.get(p.slug);
                  return (
                    <tr key={p.slug} className="bg-white hover:bg-slate-50/80">
                      <td className="px-3 py-2.5 font-medium text-slate-900">{p.label}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-700">{p.slug}</td>
                      <td className="px-3 py-2.5">
                        <a
                          href={`${origin}${p.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-medium hover:underline"
                        >
                          {p.path}
                        </a>
                      </td>
                      <td className="px-3 py-2.5">
                        {doc ? (
                          <span
                            className={
                              doc.published
                                ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                                : "inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900"
                            }
                          >
                            {doc.published ? "Published" : "Draft"}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap space-x-2">
                        {doc ? (
                          <>
                            <Link
                              href={`/admin/cms/${doc.id}`}
                              className="text-primary font-medium hover:underline"
                            >
                              View
                            </Link>
                            {canEdit && (
                              <Link
                                href={`/admin/cms/${doc.id}/edit`}
                                className="text-slate-700 font-medium hover:underline"
                              >
                                Edit
                              </Link>
                            )}
                          </>
                        ) : (
                          canCreate && (
                            <Link
                              href={`/admin/cms/new?slug=${encodeURIComponent(p.slug)}&title=${encodeURIComponent(p.label)}`}
                              className={adminBtnSecondary + " inline-flex py-1.5 px-3 text-xs"}
                            >
                              Create
                            </Link>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      ))}
    </div>
  );
}

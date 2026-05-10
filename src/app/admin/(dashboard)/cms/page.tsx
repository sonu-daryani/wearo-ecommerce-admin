import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  AdminPageHeader,
  AdminPanel,
  AdminTableThead,
} from "@/components/admin/admin-page";
import { can, canCreateCms, canEditCms } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { DeleteCmsButton } from "./delete-cms-button";
import { StorefrontPagesPanel } from "./storefront-pages-panel";

export const metadata = {
  title: "CMS",
  robots: { index: false, follow: false },
};

export default async function AdminCmsListPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  const canCreate = canCreateCms(role);
  const canEdit = canEditCms(role);
  const canDelete = can(role, "cms:delete");

  const docs = await prisma.cmsDocument.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { email: true, name: true } } },
  });

  return (
    <div className="space-y-8 pb-8">
      <AdminPageHeader
        backHref="/admin"
        backLabel="Dashboard"
        title="CMS documents"
        description={
          <>
            Pages, announcements, and banner copy. Published content is served via{" "}
            <code className="rounded bg-slate-100 px-1 text-xs">/api/cms/public/[slug]</code> on the
            storefront. Use the tables below for marketing slugs that match footer routes. Hero and
            style tiles:{" "}
            <Link href="/admin/cms/site-images" className="font-medium text-primary hover:underline">
              Site images
            </Link>
            .
          </>
        }
        actions={
          <>
            <Link href="/admin/cms/site-images" className={adminBtnSecondary}>
              Site images
            </Link>
            {canCreate && (
              <Link href="/admin/cms/new" className={adminBtnPrimary}>
                New document
              </Link>
            )}
          </>
        }
      />

      <StorefrontPagesPanel />

      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <AdminTableThead>
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </AdminTableThead>
            <tbody className="divide-y divide-slate-100">
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-slate-500">
                    No documents yet.
                    {canCreate && (
                      <>
                        {" "}
                        <Link href="/admin/cms/new" className="text-primary font-medium underline">
                          Create one
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                docs.map((d) => (
                  <tr key={d.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">{d.title}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{d.slug}</td>
                    <td className="px-4 py-3 text-slate-600">{d.type}</td>
                    <td className="px-4 py-3">
                      {d.published ? (
                        <span className="inline-flex rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-medium">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-xs font-medium">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {d.updatedAt.toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/admin/cms/${d.id}`}
                        className="text-primary font-medium hover:underline"
                      >
                        View
                      </Link>
                      {canEdit && (
                        <Link
                          href={`/admin/cms/${d.id}/edit`}
                          className="text-slate-700 font-medium hover:underline"
                        >
                          Edit
                        </Link>
                      )}
                      {canDelete && <DeleteCmsButton id={d.id} />}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}

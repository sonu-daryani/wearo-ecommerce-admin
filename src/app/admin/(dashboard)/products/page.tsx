import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import {
  adminBtnPrimary,
  AdminPageHeader,
  AdminPanel,
  AdminTableThead,
} from "@/components/admin/admin-page";
import {
  canCreateProducts,
  canEditProducts,
  can,
  isSuperAdmin,
} from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { DeleteProductButton } from "./delete-product-button";

export const metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  const canCreate = canCreateProducts(role);
  const canEdit = canEditProducts(role);
  const canDelete = can(role, "product:delete");
  const superAdmin = isSuperAdmin(role);

  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <div className="space-y-8 pb-8">
      <AdminPageHeader
        backHref="/admin"
        backLabel="Dashboard"
        title="Products"
        description={
          <>
            Catalog in MongoDB. Images from R2 (URL) or{" "}
            <code className="rounded bg-slate-100 px-1 text-xs">/public</code>.
          </>
        }
        actions={
          canCreate ? (
            <Link href="/admin/products/new" className={adminBtnPrimary}>
              New product
            </Link>
          ) : undefined
        }
      />

      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <AdminTableThead>
              <tr>
                <th className="px-4 py-3 font-medium w-16">Img</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Sections</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Catalog</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </AdminTableThead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-slate-500">
                    No products. Run{" "}
                    <code className="text-xs bg-slate-100 px-1">npm run seed:products</code> or
                    create one.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-4 py-2">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-slate-100">
                        <Image
                          src={p.srcUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized={p.srcUrl.startsWith("http")}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 font-medium text-slate-900">{p.title}</td>
                    <td className="px-4 py-2 font-mono text-xs">{p.id}</td>
                    <td className="px-4 py-2">${p.price}</td>
                    <td className="px-4 py-2 text-xs text-slate-600">
                      {[p.sectionNewArrival && "New", p.sectionTopSelling && "Top", p.sectionRelated && "Related"]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-4 py-2">
                      {p.published ? (
                        <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-medium">
                          Live
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-xs font-medium">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {p.isDefault ? (
                        <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-xs font-medium">
                          Seed default
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/shop/product/${p.id}/${p.slug}`}
                        className="text-xs font-medium text-primary hover:underline"
                        target="_blank"
                      >
                        View
                      </Link>
                      {canEdit && (
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="text-xs font-medium text-slate-700 hover:underline"
                        >
                          Edit
                        </Link>
                      )}
                      {canDelete && (!p.isDefault || superAdmin) && (
                        <DeleteProductButton id={p.id} />
                      )}
                      {canDelete && p.isDefault && !superAdmin && (
                        <span
                          className="text-slate-400 text-xs"
                          title="Seed catalog — ask a super admin to remove"
                        >
                          Default
                        </span>
                      )}
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

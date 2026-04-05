import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { DeleteProductButton } from "./delete-product-button";

export const metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  const canWrite = can(role, "product:write");
  const canDelete = can(role, "product:delete");

  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-600 mt-1">
            Catalog is stored in MongoDB. Images can be served from R2 (public URL) or local{" "}
            <code className="text-xs bg-slate-200 px-1 rounded">/public</code>.
          </p>
        </div>
        {canWrite && (
          <Link
            href="/admin/products/new"
            className="rounded-full bg-slate-900 text-white px-5 py-2.5 text-sm font-medium text-center hover:bg-slate-800"
          >
            New product
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium w-16">Img</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Sections</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    No products. Run{" "}
                    <code className="text-xs bg-slate-100 px-1">npm run seed:products</code> or
                    create one.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
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
                    <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/shop/product/${p.id}/${p.slug}`}
                        className="text-primary font-medium hover:underline text-xs"
                        target="_blank"
                      >
                        View
                      </Link>
                      {canWrite && (
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="text-slate-700 font-medium hover:underline text-xs"
                        >
                          Edit
                        </Link>
                      )}
                      {canDelete && <DeleteProductButton id={p.id} />}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

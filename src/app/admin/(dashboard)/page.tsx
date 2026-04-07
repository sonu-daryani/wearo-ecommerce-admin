import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can, ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export default async function AdminHomePage() {
  const session = await auth();
  const role = session?.user?.role as Role;

  const [totalDocs, publishedDocs, totalProducts, publishedProducts, orderCount, customerCount] =
    await Promise.all([
      prisma.cmsDocument.count(),
      prisma.cmsDocument.count({ where: { published: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { published: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
    ]);

  const canWrite = can(role, "cms:write");
  const canDelete = can(role, "cms:delete");
  const canProductWrite = can(role, "product:write");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h1>
      <p className="text-slate-600 text-sm mb-8">
        Signed in as <span className="font-medium">{session?.user?.email}</span> —{" "}
        {ROLE_LABELS[role]}.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-10">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">CMS entries</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{totalDocs}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">CMS published</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{publishedDocs}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Products</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{totalProducts}</p>
          <p className="text-xs text-slate-500 mt-1">{publishedProducts} live on shop</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Orders</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{orderCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Customers</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{customerCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Your permissions</p>
          <ul className="mt-2 text-sm text-slate-700 space-y-1">
            <li>{can(role, "cms:read") ? "✓ CMS read" : "— CMS read"}</li>
            <li>{canWrite ? "✓ CMS write" : "— CMS write"}</li>
            <li>{canDelete ? "✓ CMS delete" : "— CMS delete"}</li>
            <li>{can(role, "product:read") ? "✓ Products read" : "— Products read"}</li>
            <li>{canProductWrite ? "✓ Products write" : "— Products write"}</li>
            <li>{can(role, "order:read") ? "✓ Orders & store" : "— Orders & store"}</li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/cms"
            className="rounded-full bg-slate-900 text-white px-5 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Open CMS
          </Link>
          {canWrite && (
            <Link
              href="/admin/cms/new"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-slate-50"
            >
              New document
            </Link>
          )}
          {canProductWrite && (
            <Link
              href="/admin/products/new"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-slate-50"
            >
              New product
            </Link>
          )}
          <Link
            href="/admin/products"
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Manage products
          </Link>
          <Link
            href="/admin/crm"
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Store overview
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Orders
          </Link>
          <Link
            href="/admin/customers"
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Customers
          </Link>
          {canWrite && (
            <Link
              href="/admin/settings"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Company settings
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

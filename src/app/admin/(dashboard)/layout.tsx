import Link from "next/link";
import { AdminMain } from "./admin-main";
import SignOutButton from "@/components/auth/SignOutButton";
import { auth } from "@/auth";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const storefrontUrl =
    process.env.NEXT_PUBLIC_STOREFRONT_URL?.replace(/\/$/, "") || "http://localhost:3000";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white md:flex flex-col md:fixed md:inset-y-0 md:left-0 md:z-30 overflow-y-auto overscroll-contain">
          <div className="p-4 border-b border-slate-200">
            <Link href="/admin" className="text-lg font-bold text-slate-900">
              Wearo Admin
            </Link>
            <p className="text-xs text-slate-500 mt-1">Store, CMS &amp; settings</p>
          </div>
          <nav className="flex flex-col p-2 gap-0.5">
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Store
            </p>
            <Link
              href="/admin/crm"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Store overview
            </Link>
            <Link
              href="/admin/orders"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Orders
            </Link>
            <Link
              href="/admin/customers"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Customers
            </Link>
            <Link
              href="/admin/products"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Products
            </Link>
            <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Content
            </p>
            <Link
              href="/admin/cms"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              CMS documents
            </Link>
            <Link
              href="/admin/cms/site-images"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Site images
            </Link>
            <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Settings
            </p>
            <Link
              href="/admin/settings"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Company settings
            </Link>
            <Link
              href="/admin/settings/payment"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Payment settings
            </Link>
            <Link
              href="/admin/editor"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Storefront editor
            </Link>
            <a
              href={storefrontUrl}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 mt-4"
            >
              ← Storefront
            </a>
          </nav>
          <div className="mt-auto p-4 border-t border-slate-200 text-xs text-slate-500 space-y-3">
            <div>
              <p className="font-medium text-slate-700 truncate">{session?.user?.email}</p>
              <p className="mt-0.5">{role ? ROLE_LABELS[role] : "—"}</p>
            </div>
            <SignOutButton size="sm" className="w-full" />
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0 md:pl-56">
          <header className="md:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Link href="/admin" className="font-bold shrink-0">
                Admin
              </Link>
              <SignOutButton size="sm" variant="outline" className="shrink-0 text-xs" />
            </div>
            <div className="flex gap-2 text-xs sm:text-sm flex-wrap">
              <Link href="/admin/crm" className="text-primary font-medium">
                Store
              </Link>
              <Link href="/admin/orders" className="text-primary font-medium">
                Orders
              </Link>
              <Link href="/admin/customers" className="text-primary font-medium">
                Customers
              </Link>
              <Link href="/admin/products" className="text-primary font-medium">
                Products
              </Link>
              <Link href="/admin/cms" className="text-primary font-medium">
                CMS
              </Link>
              <Link href="/admin/settings" className="text-primary font-medium">
                Settings
              </Link>
            </div>
          </header>
          <AdminMain>{children}</AdminMain>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCompanySettings } from "@/lib/company-settings";
import { getPaymentSetupChecklist } from "@/lib/payment-setup-checklist";
import { PaymentSetupChecklist } from "./payment-setup-checklist";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-page";
import {
  ArrowRight,
  CreditCard,
  FileText,
  Package,
  Settings2,
  ShoppingCart,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Store overview",
  robots: { index: false, follow: false },
};

const shortcutCard =
  "group flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-primary/25 hover:shadow-md";

export default async function CrmPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  if (!can(role, "order:read") || !can(role, "customer:read")) {
    redirect("/admin/forbidden");
  }

  const canWrite = can(role, "cms:write");

  const [orderCount, customerCount, paidOrdersAgg, settings] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { grandTotal: true },
    }),
    getCompanySettings(),
  ]);

  const checklist = getPaymentSetupChecklist(settings);

  const revenueFormatted =
    paidOrdersAgg._sum.grandTotal != null
      ? new Intl.NumberFormat(settings.currencyLocale, {
          style: "currency",
          currency: settings.currencyCode,
          maximumFractionDigits: settings.currencyDecimalPlaces,
        }).format(paidOrdersAgg._sum.grandTotal)
      : "—";

  return (
    <div className="space-y-10 pb-8">
      <AdminPageHeader
        backHref="/admin"
        backLabel="Dashboard"
        title="Store overview"
        description={
          <>
            Customers, orders, and revenue at a glance. Catalog and CMS live under their own
            sections; company profile and gateways under Settings.
          </>
        }
      />

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/orders"
          className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-primary/25 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <ShoppingCart className="h-5 w-5" aria-hidden />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Orders</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{orderCount}</p>
          <p className="mt-1 text-xs font-medium text-primary">View all →</p>
        </Link>

        <Link
          href="/admin/customers"
          className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-primary/25 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Users className="h-5 w-5" aria-hidden />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Customers
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{customerCount}</p>
          <p className="mt-1 text-xs font-medium text-primary">View all →</p>
        </Link>

        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm sm:col-span-2 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Paid revenue (tracked)
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{revenueFormatted}</p>
          <p className="mt-2 text-xs leading-snug text-slate-400">
            Sum of orders with payment status <span className="text-slate-200">Paid</span>
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <PaymentSetupChecklist summary={checklist} canEditPayment={canWrite} />

        <AdminPanel padded>
          <h2 className="text-lg font-semibold text-slate-900">Shortcuts</h2>
          <p className="mt-1 text-sm text-slate-600">Jump to common tasks.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/admin/orders" className={shortcutCard}>
              <div className="flex items-center justify-between">
                <ShoppingCart className="h-5 w-5 text-slate-700" aria-hidden />
                <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-3 font-semibold text-slate-900">Orders</p>
              <p className="mt-1 text-xs text-slate-500">Status, payment, totals</p>
            </Link>
            <Link href="/admin/customers" className={shortcutCard}>
              <div className="flex items-center justify-between">
                <Users className="h-5 w-5 text-slate-700" aria-hidden />
                <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-3 font-semibold text-slate-900">Customers</p>
              <p className="mt-1 text-xs text-slate-500">Shopper accounts</p>
            </Link>
            <Link href="/admin/products" className={shortcutCard}>
              <div className="flex items-center justify-between">
                <Package className="h-5 w-5 text-slate-700" aria-hidden />
                <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-3 font-semibold text-slate-900">Products</p>
              <p className="mt-1 text-xs text-slate-500">Catalog &amp; merchandising</p>
            </Link>
            <Link href="/admin/cms" className={shortcutCard}>
              <div className="flex items-center justify-between">
                <FileText className="h-5 w-5 text-slate-700" aria-hidden />
                <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-3 font-semibold text-slate-900">CMS</p>
              <p className="mt-1 text-xs text-slate-500">Pages &amp; copy</p>
            </Link>
            <Link href="/admin/settings" className={shortcutCard}>
              <div className="flex items-center justify-between">
                <Settings2 className="h-5 w-5 text-slate-700" aria-hidden />
                <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-3 font-semibold text-slate-900">Company settings</p>
              <p className="mt-1 text-xs text-slate-500">Brand, SEO, currency</p>
            </Link>
            {canWrite ? (
              <Link href="/admin/settings/payment" className={shortcutCard}>
                <div className="flex items-center justify-between">
                  <CreditCard className="h-5 w-5 text-slate-700" aria-hidden />
                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <p className="mt-3 font-semibold text-slate-900">Payment settings</p>
                <p className="mt-1 text-xs text-slate-500">COD, providers, keys</p>
              </Link>
            ) : (
              <div className={`${shortcutCard} cursor-not-allowed opacity-60`}>
                <CreditCard className="h-5 w-5 text-slate-400" aria-hidden />
                <p className="mt-3 font-semibold text-slate-900">Payment settings</p>
                <p className="mt-1 text-xs text-slate-500">Editors only</p>
              </div>
            )}
          </div>
        </AdminPanel>
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        Automations (email, refunds) can be wired to your storefront or APIs server-side — no internal
        URLs in the browser.
      </p>
    </div>
  );
}

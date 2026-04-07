import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getCompanySettings } from "@/lib/company-settings";
import { getPaymentSetupChecklist } from "@/lib/payment-setup-checklist";
import { PaymentSetupChecklist } from "./payment-setup-checklist";

export const metadata = {
  title: "Store overview",
  robots: { index: false, follow: false },
};

const hubCardClass =
  "rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors";

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

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin" className="text-sm text-primary hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Store overview</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Shopify-style hub for customers, orders, and getting payments live. Content and catalog stay
          under CMS / products; company and gateways live under settings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Orders</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{orderCount}</p>
          <Link href="/admin/orders" className="text-xs font-medium text-indigo-600 hover:underline mt-2 inline-block">
            View all →
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Customers</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{customerCount}</p>
          <Link
            href="/admin/customers"
            className="text-xs font-medium text-indigo-600 hover:underline mt-2 inline-block"
          >
            View all →
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Paid revenue (tracked)</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {paidOrdersAgg._sum.grandTotal != null
              ? new Intl.NumberFormat(settings.currencyLocale, {
                  style: "currency",
                  currency: settings.currencyCode,
                  maximumFractionDigits: settings.currencyDecimalPlaces,
                }).format(paidOrdersAgg._sum.grandTotal)
              : "—"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Sum of orders with payment status Paid</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <PaymentSetupChecklist summary={checklist} canEditPayment={canWrite} />
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Shortcuts</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/admin/orders" className={hubCardClass}>
              <p className="font-medium text-slate-900">Orders</p>
              <p className="text-xs text-slate-500 mt-1">Status, payment, totals</p>
            </Link>
            <Link href="/admin/customers" className={hubCardClass}>
              <p className="font-medium text-slate-900">Customers</p>
              <p className="text-xs text-slate-500 mt-1">Shopper accounts</p>
            </Link>
            <Link href="/admin/products" className={hubCardClass}>
              <p className="font-medium text-slate-900">Products</p>
              <p className="text-xs text-slate-500 mt-1">Catalog &amp; merchandising</p>
            </Link>
            <Link href="/admin/cms" className={hubCardClass}>
              <p className="font-medium text-slate-900">CMS</p>
              <p className="text-xs text-slate-500 mt-1">Pages &amp; copy</p>
            </Link>
            <Link href="/admin/settings" className={hubCardClass}>
              <p className="font-medium text-slate-900">Company settings</p>
              <p className="text-xs text-slate-500 mt-1">Brand, SEO, currency</p>
            </Link>
            {canWrite ? (
              <Link href="/admin/settings/payment" className={hubCardClass}>
                <p className="font-medium text-slate-900">Payment settings</p>
                <p className="text-xs text-slate-500 mt-1">COD, providers, keys</p>
              </Link>
            ) : (
              <div className={`${hubCardClass} opacity-60 cursor-not-allowed`}>
                <p className="font-medium text-slate-900">Payment settings</p>
                <p className="text-xs text-slate-500 mt-1">Editors only</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <p className="text-xs text-slate-500">
        Advanced automation (email flows, refunds) can call your storefront or API server-side from
        these routes later — the browser never needs internal base URLs.
      </p>
    </div>
  );
}

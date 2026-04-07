import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import {
  formatMoney,
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/order-admin";

export const metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 50;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const session = await auth();
  const role = session?.user?.role as Role;
  if (!can(role, "order:read")) {
    redirect("/admin/forbidden");
  }

  const total = await prisma.order.count();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requestedPage = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * PAGE_SIZE;

  const orders = await prisma.order.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE,
    skip,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      paymentProvider: true,
      currencyCode: true,
      grandTotal: true,
      createdAt: true,
      user: { select: { email: true, name: true } },
      shipping: true,
    },
  });

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/crm" className="text-sm text-primary hover:underline">
          ← Store overview
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Orders</h1>
        <p className="text-sm text-slate-600 mt-1">
          Orders from the shared database (same as the storefront checkout). Use filters in Prisma Studio
          for advanced queries.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No orders yet. Completed checkouts from the shop will appear here.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const ship = o.shipping as { email?: string } | null;
                  const email = o.user?.email ?? ship?.email ?? "—";
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          {o.orderNumber}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5 capitalize">
                          {o.paymentMethod}
                          {o.paymentProvider ? ` · ${o.paymentProvider}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {o.createdAt.toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate" title={email}>
                        {email}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {PAYMENT_STATUS_LABEL[o.paymentStatus]}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{ORDER_STATUS_LABEL[o.status]}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900 whitespace-nowrap">
                        {formatMoney(o.grandTotal, o.currencyCode)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-slate-100 text-sm text-slate-600">
            <span>
              Showing {skip + 1}–{Math.min(skip + orders.length, total)} of {total}
              {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
            </span>
            {totalPages > 1 && (
              <div className="flex flex-wrap gap-2">
                {page > 1 && (
                  <Link
                    href={page === 2 ? "/admin/orders" : `/admin/orders?page=${page - 1}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/orders?page=${page + 1}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

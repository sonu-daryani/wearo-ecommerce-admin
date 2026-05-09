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
import {
  AdminPageHeader,
  AdminPanel,
  AdminTableFooter,
  AdminTableThead,
} from "@/components/admin/admin-page";

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
    <div className="space-y-8 pb-8">
      <AdminPageHeader
        backHref="/admin/crm"
        backLabel="Store overview"
        title="Orders"
        description={
          <>
            Same database as storefront checkout. Latest orders first; open a row for full detail.
            Use Prisma Studio for heavy filtering.
          </>
        }
      />

      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <AdminTableThead>
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </AdminTableThead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-slate-500">
                    No orders yet. Completed checkouts from the shop will appear here.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const ship = o.shipping as { email?: string } | null;
                  const email = o.user?.email ?? ship?.email ?? "—";
                  return (
                    <tr key={o.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                        <p className="mt-0.5 text-xs capitalize text-slate-500">
                          {o.paymentMethod}
                          {o.paymentProvider ? ` · ${o.paymentProvider}` : ""}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {o.createdAt.toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-slate-700" title={email}>
                        {email}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {PAYMENT_STATUS_LABEL[o.paymentStatus]}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{ORDER_STATUS_LABEL[o.status]}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">
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
          <AdminTableFooter>
            <span>
              Showing {skip + 1}–{Math.min(skip + orders.length, total)} of {total}
              {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
            </span>
            {totalPages > 1 && (
              <div className="flex flex-wrap gap-2">
                {page > 1 && (
                  <Link
                    href={page === 2 ? "/admin/orders" : `/admin/orders?page=${page - 1}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium hover:bg-slate-50"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/orders?page=${page + 1}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium hover:bg-slate-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </AdminTableFooter>
        )}
      </AdminPanel>
    </div>
  );
}

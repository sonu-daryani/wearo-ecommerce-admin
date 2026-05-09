import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-page";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import {
  formatMoney,
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  parseOrderItems,
  parseOrderShipping,
} from "@/lib/order-admin";

export const metadata = {
  title: "Order detail",
  robots: { index: false, follow: false },
};

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const role = session?.user?.role as Role;
  if (!can(role, "order:read")) {
    redirect("/admin/forbidden");
  }

  const { id } = params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!order) notFound();

  const lines = parseOrderItems(order.items);
  const shipping = parseOrderShipping(order.shipping);

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <AdminPageHeader
        backHref="/admin/orders"
        backLabel="Orders"
        title={order.orderNumber}
        description={
          <>
            Placed{" "}
            {order.createdAt.toLocaleString(undefined, {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order status</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {ORDER_STATUS_LABEL[order.status]}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {PAYMENT_STATUS_LABEL[order.paymentStatus]}
          </p>
          <p className="mt-2 text-sm capitalize text-slate-600">
            {order.paymentMethod}
            {order.paymentProvider ? ` · ${order.paymentProvider}` : ""}
          </p>
        </div>
      </div>

      <AdminPanel padded className="mb-0">
        <h2 className="font-semibold text-slate-900 mb-4">Line items</h2>
        {lines.length === 0 ? (
          <p className="text-sm text-slate-500">No line items parsed (legacy shape).</p>
        ) : (
          <ul className="space-y-4">
            {lines.map((line) => (
              <li key={`${line.id}-${line.name}`} className="flex gap-4">
                <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                  <Image
                    src={line.srcUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={line.srcUrl.startsWith("http")}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{line.name}</p>
                  <p className="text-sm text-slate-600">
                    Qty {line.quantity} × {formatMoney(line.price, order.currencyCode)}
                  </p>
                  {line.attributes?.length ? (
                    <p className="text-xs text-slate-500 mt-1">{line.attributes.join(" · ")}</p>
                  ) : null}
                </div>
                <p className="text-sm font-medium text-slate-900 shrink-0">
                  {formatMoney(line.price * line.quantity, order.currencyCode)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <dl className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Subtotal</dt>
            <dd>{formatMoney(order.subtotal, order.currencyCode)}</dd>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt>Discount</dt>
              <dd>−{formatMoney(order.discountAmount, order.currencyCode)}</dd>
            </div>
          )}
          {order.codFee > 0 && (
            <div className="flex justify-between">
              <dt className="text-slate-600">COD fee</dt>
              <dd>{formatMoney(order.codFee, order.currencyCode)}</dd>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold text-slate-900 pt-2 border-t border-slate-100">
            <dt>Total</dt>
            <dd>{formatMoney(order.grandTotal, order.currencyCode)}</dd>
          </div>
        </dl>
      </AdminPanel>

      <AdminPanel padded>
        <h2 className="font-semibold text-slate-900 mb-4">Shipping &amp; account</h2>
        {shipping ? (
          <dl className="text-sm space-y-2">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">{shipping.fullName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="text-slate-800">{shipping.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="text-slate-800">{shipping.phone}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Address</dt>
              <dd className="text-slate-800">
                {shipping.address}, {shipping.city} {shipping.pin}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-slate-500">Shipping payload could not be parsed.</p>
        )}
        {order.user && (
          <p className="text-sm text-slate-600 mt-4 pt-4 border-t border-slate-100">
            <span className="font-medium text-slate-800">Linked account:</span>{" "}
            {order.user.email ?? order.user.id}
            {order.user.name ? ` (${order.user.name})` : ""}
          </p>
        )}
      </AdminPanel>

      <p className="text-xs leading-relaxed text-slate-500">
        Internal reference: <code className="bg-slate-100 px-1 rounded">{order.id}</code> · Guest
        link uses <code className="bg-slate-100 px-1 rounded">publicToken</code> on the storefront, not
        shown here for security.
      </p>
    </div>
  );
}

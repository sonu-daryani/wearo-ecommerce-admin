import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { AdminPageHeader, AdminPanel, AdminTableThead } from "@/components/admin/admin-page";

export const metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

const STAFF_ROLES = new Set<string>([
  "ADMIN",
  "SUPERADMIN",
  "EDITOR",
  "VIEWER",
  "CONTRIBUTOR",
]);

function isStaffRole(role: string | null | undefined): boolean {
  if (role == null || role === "") return false;
  return STAFF_ROLES.has(role);
}

export default async function AdminCustomersPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  if (!can(role, "customer:read")) {
    redirect("/admin/forbidden");
  }

  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      image: true,
      role: true,
      _count: { select: { orders: true } },
    },
  });

  const customers = rows.filter((u) => !isStaffRole(u.role as string | null | undefined));

  return (
    <div className="space-y-8 pb-8">
      <AdminPageHeader
        backHref="/admin/crm"
        backLabel="Store overview"
        title="Customers"
        description={
          <>
            Storefront sign-ups (including Google). Staff accounts (admin, editor, viewer,
            contributor, …) are excluded from this list.
          </>
        }
      />

      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <AdminTableThead>
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Orders</th>
              </tr>
            </AdminTableThead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-14 text-center text-slate-500">
                    No customer accounts yet. Registrations from the storefront appear here.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {c.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.image}
                            alt=""
                            className="h-9 w-9 rounded-full bg-slate-100 object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                            {(c.name ?? c.email ?? "?").slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-slate-900">{c.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <span className="break-all">{c.email ?? "—"}</span>
                      {c.emailVerified && (
                        <span className="ml-2 text-xs font-medium text-emerald-600">Verified</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {c.createdAt.toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {c._count.orders > 0 ? (
                        <Link
                          href="/admin/orders"
                          className="text-primary hover:underline"
                          title="Open orders list"
                        >
                          {c._count.orders}
                        </Link>
                      ) : (
                        <span className="text-slate-400">0</span>
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

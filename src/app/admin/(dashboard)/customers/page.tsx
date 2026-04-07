import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

const STAFF_ROLES = new Set<string>(["ADMIN", "SUPERADMIN", "EDITOR", "VIEWER"]);

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

  // Load all users, then drop staff in JS. Prisma `role: { notIn: [...] }` omits MongoDB
  // documents where `role` is missing (OAuth / legacy), which should still appear as customers.
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
    <div>
      <div className="mb-6">
        <Link href="/admin/crm" className="text-sm text-primary hover:underline">
          ← Store overview
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Customers</h1>
        <p className="text-sm text-slate-600 mt-1">
          All storefront sign-ups (including Google) except staff accounts (Admin, Super admin, Editor,
          Viewer).
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                    No customer accounts yet. Registrations from the storefront appear here.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {c.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.image}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover bg-slate-100"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                            {(c.name ?? c.email ?? "?").slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-slate-900">{c.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <span className="break-all">{c.email ?? "—"}</span>
                      {c.emailVerified && (
                        <span className="ml-2 text-xs text-emerald-600 font-medium">Verified</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {c.createdAt.toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {c._count.orders > 0 ? (
                        <Link
                          href={`/admin/orders`}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Open orders list; filter by customer in Studio if needed"
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
      </div>
    </div>
  );
}

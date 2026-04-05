import Link from "next/link";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "CRM",
  robots: { index: false, follow: false },
};

export default async function CrmPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  if (!can(role, "cms:read")) {
    redirect("/admin/forbidden");
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-primary hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">CRM</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-xl">
          Placeholder for customers, orders, and support tools. Call your Nest (or other) API from
          here server-side, or from the storefront via{" "}
          <code className="text-xs bg-slate-100 px-1 rounded">/api/proxy/…</code> on the shop so the
          browser never sees the internal base URL.
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500 text-sm">
        Add modules (e.g. orders list) when your backend is ready.
      </div>
    </div>
  );
}

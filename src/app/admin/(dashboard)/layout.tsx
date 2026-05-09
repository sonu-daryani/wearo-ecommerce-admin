import { AdminMain } from "./admin-main";
import { AdminMobileNav, AdminSidebar } from "@/components/admin/admin-navigation";
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
    <div className="min-h-screen bg-[linear-gradient(160deg,#f1f5f9_0%,#f8fafc_45%,#e2e8f0_100%)] text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar
          storefrontUrl={storefrontUrl}
          email={session?.user?.email}
          roleLabel={role ? ROLE_LABELS[role] : "—"}
        />
        <div className="flex min-w-0 flex-1 flex-col md:pl-60">
          <AdminMobileNav />
          <AdminMain>{children}</AdminMain>
        </div>
      </div>
    </div>
  );
}

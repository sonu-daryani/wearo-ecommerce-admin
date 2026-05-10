import Link from "next/link";
import { auth } from "@/auth";
import SignOutButton from "@/components/auth/SignOutButton";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { ShieldAlert } from "lucide-react";

export default async function AdminForbiddenPage() {
  const session = await auth();
  const role = (session?.user?.role ?? "CUSTOMER") as Role;
  const storefrontUrl =
    process.env.NEXT_PUBLIC_STOREFRONT_URL?.replace(/\/$/, "") || "http://localhost:3000";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-lg shadow-slate-900/5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <ShieldAlert className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="mt-6 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Admin access required
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Signed in as{" "}
          <span className="font-medium text-slate-800">{session?.user?.email ?? "—"}</span>
          <span className="text-slate-400"> · </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
            {ROLE_LABELS[role]}
          </span>
          . This panel is limited to staff roles (viewer, contributor, editor, admin, …).
        </p>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Ask an administrator to update your role in the database, then sign out and sign in again.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={storefrontUrl}
            className="inline-flex justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            Back to store
          </Link>
          <SignOutButton
            variant="outline"
            className="inline-flex h-auto justify-center rounded-full border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Log out
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}

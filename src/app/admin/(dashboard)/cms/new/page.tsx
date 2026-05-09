import Link from "next/link";
import { auth } from "@/auth";
import { AdminPageHeader } from "@/components/admin/admin-page";
import { redirect } from "next/navigation";
import { canCreateCms } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { CmsCreateForm } from "./create-form";

export const metadata = {
  title: "New CMS document",
  robots: { index: false, follow: false },
};

export default async function NewCmsPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  if (!canCreateCms(role)) {
    redirect("/admin/cms");
  }

  return (
    <div className="space-y-8 pb-8">
      <AdminPageHeader
        backHref="/admin/cms"
        backLabel="CMS documents"
        title="New document"
        description={
          <>
            Create a page, announcement, or banner copy. Slug must be unique —{" "}
            <Link href="/admin/cms" className="font-medium text-primary hover:underline">
              back to list
            </Link>{" "}
            to compare existing slugs.
          </>
        }
      />
      <CmsCreateForm />
    </div>
  );
}

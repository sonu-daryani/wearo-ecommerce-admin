import { auth } from "@/auth";
import { AdminPageHeader } from "@/components/admin/admin-page";
import { canCreateProducts } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { createProduct, type ProductFormState } from "../actions";
import { ProductForm } from "../product-form";

export const metadata = {
  title: "New product",
  robots: { index: false, follow: false },
};

const initial: ProductFormState = {};

export default async function NewProductPage() {
  const session = await auth();
  const role = session?.user?.role as Role;
  if (!canCreateProducts(role)) {
    redirect("/admin/forbidden");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-8">
      <AdminPageHeader
        backHref="/admin/products"
        backLabel="Products"
        title="New product"
        description="Fill in details below; a numeric ID is assigned when you save."
      />
      <ProductForm action={createProduct} initialState={initial} mode="create" />
    </div>
  );
}

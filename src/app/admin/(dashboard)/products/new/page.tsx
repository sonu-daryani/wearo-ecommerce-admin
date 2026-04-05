import Link from "next/link";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
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
  if (!can(role, "product:write")) {
    redirect("/admin/forbidden");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-primary hover:underline">
          ← Products
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">New product</h1>
        <p className="text-sm text-slate-600 mt-1">ID is assigned automatically on save.</p>
      </div>
      <ProductForm action={createProduct} initialState={initial} mode="create" />
    </div>
  );
}

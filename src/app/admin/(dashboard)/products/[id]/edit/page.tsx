import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { getProductRowById } from "@/lib/product-queries";
import { updateProduct, type ProductFormState } from "../../actions";
import { ProductForm } from "../../product-form";

export const metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

const initial: ProductFormState = {};

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const session = await auth();
  const role = session?.user?.role as Role;
  if (!can(role, "product:write")) {
    redirect("/admin/forbidden");
  }

  const row = await getProductRowById(id);
  if (!row) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-primary hover:underline">
          ← Products
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Edit product</h1>
        <p className="text-sm text-slate-600 mt-1">
          ID <span className="font-mono">{row.id}</span> — URL path stays{" "}
          <code className="text-xs bg-slate-100 px-1 rounded">/shop/product/{row.id}/…</code>
        </p>
      </div>
      <ProductForm
        action={updateProduct}
        initialState={initial}
        mode="edit"
        product={{
          id: row.id,
          slug: row.slug,
          title: row.title,
          srcUrl: row.srcUrl,
          gallery: row.gallery,
          price: row.price,
          discountAmount: row.discountAmount,
          discountPercentage: row.discountPercentage,
          rating: row.rating,
          sectionNewArrival: row.sectionNewArrival,
          sectionTopSelling: row.sectionTopSelling,
          sectionRelated: row.sectionRelated,
          published: row.published,
        }}
      />
    </div>
  );
}

"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { can, isSuperAdmin } from "@/lib/rbac";
import { getNextProductId } from "@/lib/product-queries";
import type { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type ProductFormState = {
  error?: string;
  toastAt?: number;
  redirectTo?: string;
};

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseGallery(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function revalidateProductPaths() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/api/products");
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!session?.user?.id || !can(role, "product:write")) {
    return { error: "Forbidden." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim().toLowerCase();
  const srcUrl = String(formData.get("srcUrl") ?? "").trim();
  const galleryRaw = String(formData.get("gallery") ?? "");
  const price = Number(formData.get("price"));
  const discountAmount = Number(formData.get("discountAmount") ?? 0) || 0;
  const discountPercentage = Number(formData.get("discountPercentage") ?? 0) || 0;
  const rating = Number(formData.get("rating") ?? 0) || 0;
  const sectionNewArrival = formData.get("sectionNewArrival") === "on";
  const sectionTopSelling = formData.get("sectionTopSelling") === "on";
  const sectionRelated = formData.get("sectionRelated") === "on";
  const published = formData.get("published") === "on";

  if (!title) return { error: "Title is required." };
  if (!srcUrl) return { error: "Main image URL is required." };
  if (!Number.isFinite(price) || price < 0) return { error: "Valid price is required." };

  const slug =
    slugInput ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  if (!SLUG_REGEX.test(slug)) {
    return { error: "Invalid slug format." };
  }

  const id = await getNextProductId();

  try {
    await prisma.product.create({
      data: {
        id,
        slug,
        title,
        srcUrl,
        gallery: parseGallery(galleryRaw),
        price,
        discountAmount,
        discountPercentage,
        rating,
        sectionNewArrival,
        sectionTopSelling,
        sectionRelated,
        published,
        isDefault: false,
      },
    });
  } catch {
    return { error: "Could not create (slug may already exist)." };
  }

  revalidateProductPaths();
  revalidatePath(`/shop/product/${id}`);
  return { toastAt: Date.now(), redirectTo: "/admin/products" };
}

export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!session?.user?.id || !can(role, "product:write")) {
    return { error: "Forbidden." };
  }

  const id = Number(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim().toLowerCase();
  const srcUrl = String(formData.get("srcUrl") ?? "").trim();
  const galleryRaw = String(formData.get("gallery") ?? "");
  const price = Number(formData.get("price"));
  const discountAmount = Number(formData.get("discountAmount") ?? 0) || 0;
  const discountPercentage = Number(formData.get("discountPercentage") ?? 0) || 0;
  const rating = Number(formData.get("rating") ?? 0) || 0;
  const sectionNewArrival = formData.get("sectionNewArrival") === "on";
  const sectionTopSelling = formData.get("sectionTopSelling") === "on";
  const sectionRelated = formData.get("sectionRelated") === "on";
  const published = formData.get("published") === "on";

  if (!Number.isFinite(id)) return { error: "Invalid product." };
  if (!title) return { error: "Title is required." };
  if (!srcUrl) return { error: "Main image URL is required." };
  if (!Number.isFinite(price) || price < 0) return { error: "Valid price is required." };

  const slug =
    slugInput ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  if (!SLUG_REGEX.test(slug)) {
    return { error: "Invalid slug format." };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        slug,
        title,
        srcUrl,
        gallery: parseGallery(galleryRaw),
        price,
        discountAmount,
        discountPercentage,
        rating,
        sectionNewArrival,
        sectionTopSelling,
        sectionRelated,
        published,
      },
    });
  } catch {
    return { error: "Could not save (slug may be taken)." };
  }

  revalidateProductPaths();
  revalidatePath(`/shop/product/${id}`);
  return { toastAt: Date.now(), redirectTo: "/admin/products" };
}

export async function deleteProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!session?.user?.id || !can(role, "product:delete")) {
    return { error: "Only administrators can delete products." };
  }

  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return { error: "Invalid product." };

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true, isDefault: true },
  });
  if (!existing) return { error: "Product not found." };
  if (existing.isDefault && !isSuperAdmin(role)) {
    return {
      error: "Catalog default products can only be removed by a super admin.",
    };
  }

  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    return { error: "Could not delete." };
  }

  revalidateProductPaths();
  return { toastAt: Date.now(), redirectTo: "/admin/products" };
}

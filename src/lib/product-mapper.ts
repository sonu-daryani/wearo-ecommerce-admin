import type { Product as ProductRow } from "@prisma/client";
import type { Product } from "@/types/product.types";

export function mapDbToProduct(p: ProductRow): Product {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    srcUrl: p.srcUrl,
    gallery: p.gallery?.length ? p.gallery : undefined,
    price: p.price,
    discount: {
      amount: p.discountAmount,
      percentage: p.discountPercentage,
    },
    rating: p.rating,
  };
}

export function productDisplayPrice(product: Product): string {
  if (product.discount.percentage > 0) {
    const final = Math.round(
      product.price - (product.price * product.discount.percentage) / 100
    );
    return `$${final}`;
  }
  if (product.discount.amount > 0) {
    return `$${product.price - product.discount.amount}`;
  }
  return `$${product.price}`;
}

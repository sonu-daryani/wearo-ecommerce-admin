/**
 * Storefront marketing / legal routes and the CMS slugs editors should use.
 * Public JSON: GET {storefront}/api/cms/public/[slug] (published only).
 */
export type CmsStorefrontPageDef = {
  label: string;
  /** `CmsDocument.slug` — lowercase, hyphens (no slashes). */
  slug: string;
  /** Path on the public storefront (same DB as admin). */
  path: string;
};

export const CMS_STOREFRONT_PAGE_GROUPS: { title: string; pages: CmsStorefrontPageDef[] }[] = [
  {
    title: "Company",
    pages: [
      { label: "About", slug: "about", path: "/about" },
      { label: "Features", slug: "features", path: "/features" },
      { label: "How it works", slug: "works", path: "/works" },
      { label: "Careers", slug: "careers", path: "/careers" },
    ],
  },
  {
    title: "Help & legal",
    pages: [
      { label: "Customer support", slug: "support", path: "/support" },
      { label: "Delivery", slug: "delivery", path: "/delivery" },
      { label: "Terms & conditions", slug: "terms", path: "/terms" },
      { label: "Privacy policy", slug: "privacy", path: "/privacy" },
    ],
  },
  {
    title: "Help articles",
    pages: [
      { label: "Orders help", slug: "help-orders", path: "/help/orders" },
      { label: "Payments help", slug: "help-payments", path: "/help/payments" },
    ],
  },
  {
    title: "Resources",
    pages: [
      { label: "Resources hub", slug: "resources", path: "/resources" },
      { label: "Free eBooks", slug: "resources-ebooks", path: "/resources/ebooks" },
      { label: "Tutorials", slug: "resources-tutorials", path: "/resources/tutorials" },
      { label: "Blog", slug: "resources-blog", path: "/resources/blog" },
    ],
  },
];

export function flattenCmsStorefrontPages(): CmsStorefrontPageDef[] {
  return CMS_STOREFRONT_PAGE_GROUPS.flatMap((g) => g.pages);
}

import Link from "next/link";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  can,
  canCreateCms,
  canCreateProducts,
  canEditCms,
  canEditProducts,
  ROLE_LABELS,
} from "@/lib/rbac";
import type { Role } from "@prisma/client";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MinusCircle,
  Package,
  Settings2,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function PermRow({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-700">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
      ) : (
        <MinusCircle className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />
      )}
      <span className={ok ? "" : "text-slate-400"}>{children}</span>
    </div>
  );
}

export default async function AdminHomePage() {
  const session = await auth();
  const role = session?.user?.role as Role;

  const [totalDocs, publishedDocs, totalProducts, publishedProducts, orderCount, customerCount] =
    await Promise.all([
      prisma.cmsDocument.count(),
      prisma.cmsDocument.count({ where: { published: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { published: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
    ]);

  const canDelete = can(role, "cms:delete");
  const canProductDelete = can(role, "product:delete");
  const canNewCms = canCreateCms(role);
  const canNewProduct = canCreateProducts(role);
  const canEditExistingCms = canEditCms(role);
  const canEditExistingProduct = canEditProducts(role);

  const permissions: { ok: boolean; label: string }[] = [
    { ok: can(role, "cms:read"), label: "View CMS & pages" },
    { ok: canNewCms, label: "Create new CMS documents" },
    { ok: canEditExistingCms, label: "Edit existing CMS content" },
    { ok: canDelete, label: "Delete CMS documents" },
    { ok: can(role, "product:read"), label: "View products" },
    { ok: canNewProduct, label: "Create new products" },
    { ok: canEditExistingProduct, label: "Edit existing products" },
    { ok: canProductDelete, label: "Delete products" },
    { ok: can(role, "order:read"), label: "Orders & store overview" },
  ];

  type QuickCard = {
    title: string;
    description: string;
    href: string;
    icon: typeof Store;
    emphasis?: boolean;
    show: boolean;
  };

  const quickCards: QuickCard[] = [
    {
      title: "Store overview",
      description: "Orders, customers, revenue snapshot, payment checklist.",
      href: "/admin/crm",
      icon: Store,
      emphasis: true,
      show: true,
    },
    {
      title: "CMS documents",
      description: "Pages, announcements, and banner copy.",
      href: "/admin/cms",
      icon: FileText,
      show: true,
    },
    {
      title: "Products",
      description: "Catalog, pricing, sections, and publish status.",
      href: "/admin/products",
      icon: Package,
      show: true,
    },
    {
      title: "Orders",
      description: "Payment status, totals, and order detail.",
      href: "/admin/orders",
      icon: ShoppingCart,
      show: true,
    },
    {
      title: "Customers",
      description: "Shopper accounts from the storefront.",
      href: "/admin/customers",
      icon: Users,
      show: true,
    },
    {
      title: "Company settings",
      description: "Brand, SEO, currency, theme & payment gateways.",
      href: "/admin/settings",
      icon: Settings2,
      show: can(role, "cms:read"),
    },
  ];

  return (
    <div className="space-y-10 pb-8">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/5 blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-sm font-medium text-slate-500">{timeGreeting()}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            You’re signed in as{" "}
            <span className="font-medium text-slate-800">{session?.user?.email}</span>
            <span className="text-slate-400"> · </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {ROLE_LABELS[role]}
            </span>
            . Use the cards below to jump in, or the sidebar for every section.
          </p>
        </div>
      </section>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          At a glance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Link
            href="/admin/cms"
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-primary/25 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="rounded-lg bg-sky-50 p-2 text-sky-700">
                <FileText className="h-5 w-5" aria-hidden />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              CMS entries
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{totalDocs}</p>
            <p className="mt-1 text-xs text-slate-500">{publishedDocs} published</p>
          </Link>

          <Link
            href="/admin/products"
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-primary/25 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="rounded-lg bg-violet-50 p-2 text-violet-700">
                <Package className="h-5 w-5" aria-hidden />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Products
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{totalProducts}</p>
            <p className="mt-1 text-xs text-slate-500">{publishedProducts} live on shop</p>
          </Link>

          <Link
            href="/admin/orders"
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-primary/25 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
                <ShoppingCart className="h-5 w-5" aria-hidden />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Orders
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{orderCount}</p>
            <p className="mt-1 text-xs text-slate-500">All statuses</p>
          </Link>

          <Link
            href="/admin/customers"
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-primary/25 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                <Users className="h-5 w-5" aria-hidden />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Customers
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{customerCount}</p>
            <p className="mt-1 text-xs text-slate-500">Storefront accounts</p>
          </Link>

          <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-300" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Your access
              </p>
            </div>
            <p className="mt-3 text-sm leading-snug text-slate-200">
              Permissions control create, edit, and delete. Ask an admin if something is disabled.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-labelledby="quick-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="quick-heading" className="text-lg font-semibold text-slate-900">
                Quick links
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Common destinations — same links as the sidebar.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickCards
              .filter((c) => c.show)
              .map(({ title, description, href, icon: Icon, emphasis }) => (
                <Link
                  key={href + title}
                  href={href}
                  className={`group flex flex-col rounded-2xl border p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md ${
                    emphasis
                      ? "border-primary/20 bg-primary/[0.04]"
                      : "border-slate-200/90 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`rounded-xl p-2.5 ${
                        emphasis ? "bg-primary/15 text-primary" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
                </Link>
              ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {canNewCms && (
              <Link
                href="/admin/cms/new"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
              >
                New document
                <ArrowRight className="h-3.5 w-3.5 opacity-90" aria-hidden />
              </Link>
            )}
            {canNewProduct && (
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
              >
                New product
                <ArrowRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
              </Link>
            )}
          </div>
        </section>

        <section
          className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm"
          aria-labelledby="perm-heading"
        >
          <h2 id="perm-heading" className="text-base font-semibold text-slate-900">
            Permissions for your role
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            What you can do in this workspace right now.
          </p>
          <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-5">
            {permissions.map(({ ok, label }) => (
              <PermRow key={label} ok={ok}>
                {label}
              </PermRow>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

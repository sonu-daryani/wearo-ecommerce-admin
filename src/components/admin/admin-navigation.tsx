"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  FileText,
  ImageIcon,
  LayoutDashboard,
  Package,
  Palette,
  Settings2,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** CMS document routes — not site-images. */
function isCmsDocumentsActive(pathname: string): boolean {
  if (pathname.startsWith("/admin/cms/site-images")) return false;
  return pathname.startsWith("/admin/cms");
}

function isSiteImagesActive(pathname: string): boolean {
  return pathname.startsWith("/admin/cms/site-images");
}

/** Company & theme — not payment tab. */
function isCompanySettingsActive(pathname: string): boolean {
  if (pathname.startsWith("/admin/settings/payment")) return false;
  return pathname.startsWith("/admin/settings");
}

function isPaymentSettingsActive(pathname: string): boolean {
  return pathname.startsWith("/admin/settings/payment");
}

function navLinkClass(active: boolean) {
  return cn(
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-primary/10 text-primary border border-primary/15"
      : "text-slate-700 hover:bg-slate-100 border border-transparent"
  );
}

type ShellProps = {
  storefrontUrl: string;
  email: string | null | undefined;
  roleLabel: string;
};

export function AdminSidebar({ storefrontUrl, email, roleLabel }: ShellProps) {
  const pathname = usePathname() ?? "";

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200/90 bg-white md:flex md:fixed md:inset-y-0 md:left-0 md:z-30 overflow-y-auto overscroll-contain shadow-[4px_0_24px_-12px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200/90 bg-gradient-to-br from-slate-50 to-white px-4 py-5">
        <Link href="/admin" className="group block">
          <p className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors">
            Wearo Admin
          </p>
          <p className="mt-1 text-xs leading-snug text-slate-500">
            Catalog, CRM &amp; storefront controls
          </p>
        </Link>
      </div>

      <nav className="flex flex-col gap-0.5 p-3">
        <Link
          href="/admin"
          className={navLinkClass(isActive(pathname, "/admin"))}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Dashboard
        </Link>

        <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Store
        </p>
        <Link href="/admin/crm" className={navLinkClass(isActive(pathname, "/admin/crm"))}>
          <Store className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Store overview
        </Link>
        <Link href="/admin/orders" className={navLinkClass(isActive(pathname, "/admin/orders"))}>
          <ShoppingCart className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Orders
        </Link>
        <Link
          href="/admin/customers"
          className={navLinkClass(isActive(pathname, "/admin/customers"))}
        >
          <Users className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Customers
        </Link>
        <Link
          href="/admin/products"
          className={navLinkClass(isActive(pathname, "/admin/products"))}
        >
          <Package className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Products
        </Link>

        <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Content
        </p>
        <Link href="/admin/cms" className={navLinkClass(isCmsDocumentsActive(pathname))}>
          <FileText className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          CMS documents
        </Link>
        <Link
          href="/admin/cms/site-images"
          className={navLinkClass(isSiteImagesActive(pathname))}
        >
          <ImageIcon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Site images
        </Link>

        <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Settings
        </p>
        <Link
          href="/admin/settings"
          className={navLinkClass(isCompanySettingsActive(pathname))}
        >
          <Settings2 className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Company settings
        </Link>
        <Link
          href="/admin/settings/payment"
          className={navLinkClass(isPaymentSettingsActive(pathname))}
        >
          <CreditCard className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Payment settings
        </Link>
        <Link href="/admin/editor" className={navLinkClass(isActive(pathname, "/admin/editor"))}>
          <Palette className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Storefront editor
        </Link>

        <a
          href={storefrontUrl}
          className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          View storefront
        </a>
      </nav>

      <div className="mt-auto space-y-3 border-t border-slate-200/90 bg-slate-50/50 p-4">
        <div className="rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 text-xs">
          <p className="truncate font-medium text-slate-800" title={email ?? undefined}>
            {email ?? "—"}
          </p>
          <p className="mt-0.5 text-slate-500">{roleLabel}</p>
        </div>
        <SignOutButton size="sm" className="w-full" />
      </div>
    </aside>
  );
}

const MOBILE_LINKS: {
  href: string;
  label: string;
  active?: (pathname: string) => boolean;
}[] = [
  { href: "/admin/crm", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/cms", label: "CMS", active: isCmsDocumentsActive },
  { href: "/admin/cms/site-images", label: "Site img", active: isSiteImagesActive },
  {
    href: "/admin/settings",
    label: "Settings",
    active: (p) => isCompanySettingsActive(p) || isPaymentSettingsActive(p),
  },
];

export function AdminMobileNav() {
  const pathname = usePathname() ?? "";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <Link href="/admin" className="text-base font-bold tracking-tight text-slate-900">
          Wearo Admin
        </Link>
        <SignOutButton size="sm" variant="outline" className="shrink-0 text-xs h-8" />
      </div>
      <nav
        className="flex gap-1 overflow-x-auto px-3 pb-3 pt-0"
        aria-label="Admin sections"
      >
        <Link
          href="/admin"
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            pathname === "/admin"
              ? "bg-primary text-primary-foreground"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          )}
        >
          Home
        </Link>
        {MOBILE_LINKS.map(({ href, label, active: activeFn }) => {
          const on = activeFn ? activeFn(pathname) : isActive(pathname, href);
          return (
            <Link
              key={`${href}-${label}`}
              href={href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                on
                  ? "bg-primary text-primary-foreground"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

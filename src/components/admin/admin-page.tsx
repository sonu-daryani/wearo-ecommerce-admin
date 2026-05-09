import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Page intro: back link, title, description, optional header actions (buttons). */
export function AdminPageHeader({
  backHref,
  backLabel,
  title,
  description,
  actions,
  className,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mb-8 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            {backLabel}
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          <div className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{description}</div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}

/** White panel with consistent radius — tables, read-only blocks, or wrap forms. */
export function AdminPanel({
  children,
  className,
  padded,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm",
        padded && "p-6 sm:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminTableThead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50/95 text-slate-600">{children}</thead>
  );
}

/** Muted footer strip under tables (pagination, counts). */
export function AdminTableFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}

/** Primary / secondary button styles for header actions */
export const adminBtnPrimary =
  "inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800";
export const adminBtnSecondary =
  "inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50";

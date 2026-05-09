import Link from "next/link";
import type { PaymentSetupSummary } from "@/lib/payment-setup-checklist";

type Props = {
  summary: PaymentSetupSummary;
  canEditPayment: boolean;
};

export function PaymentSetupChecklist({ summary, canEditPayment }: Props) {
  const pct =
    summary.totalCount === 0
      ? 100
      : Math.round((summary.completedCount / summary.totalCount) * 100);

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Payment setup</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Same idea as Shopify’s setup guide: finish these before you rely on live checkout.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-slate-900">
            {summary.completedCount}/{summary.totalCount}
          </p>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Complete</p>
        </div>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-6">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-3">
        {summary.items.map((item) => (
          <li
            key={item.id}
            className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm"
          >
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              aria-hidden
              style={{
                background: item.done ? "#10b981" : "#e2e8f0",
                color: item.done ? "#fff" : "#64748b",
              }}
            >
              {item.done ? "✓" : ""}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">{item.label}</p>
              <p className="text-slate-600 mt-0.5">{item.description}</p>
              {item.href && (item.id === "company" || item.id === "currency" || canEditPayment) && (
                <Link
                  href={item.href}
                  className="inline-block mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Open →
                </Link>
              )}
              {item.href && !canEditPayment && item.id !== "company" && item.id !== "currency" && (
                <p className="mt-2 text-xs text-slate-500">Ask an editor to update payment settings.</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

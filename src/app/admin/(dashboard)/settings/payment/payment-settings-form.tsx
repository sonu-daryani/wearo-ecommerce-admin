 "use client";

import type { CompanySettings } from "@prisma/client";
import { useFormState, useFormStatus } from "react-dom";
import { useCallback, useMemo, useState } from "react";
import { BookOpen, CreditCard, Trash2 } from "lucide-react";
import { useAdminFormToast } from "@/hooks/use-admin-form-toast";
import type { PaymentSettingsFormState } from "./actions";
import { updatePaymentSettings } from "./actions";
import {
  ProviderIntegrationGuideBody,
  providerIntegrationDocUrl,
  providerIntegrationTitle,
  type PaymentProviderId,
} from "./provider-integration-guides";

/** Client-safe row: secret key fields never leave the server. */
export type PaymentSettingsFormModel = Omit<
  CompanySettings,
  "cashfreeClientSecret" | "razorpayKeySecret" | "paytmMerchantKey" | "phonepeSaltKey" | "payuMerchantKey" | "payuSalt"
> & {
  cashfreeSecretOnFile: boolean;
  razorpaySecretOnFile: boolean;
  paytmMerchantKeyOnFile: boolean;
  phonepeSaltKeyOnFile: boolean;
  payuMerchantKeyOnFile: boolean;
  payuSaltOnFile: boolean;
};

const PROVIDER_LABELS: Record<PaymentProviderId, string> = {
  CASHFREE: "Cashfree",
  PAYTM: "Paytm",
  PHONEPE: "PhonePe",
  PAYU: "PayU",
  STRIPE: "Stripe",
  RAZORPAY: "Razorpay",
};

const ALL_PROVIDERS: PaymentProviderId[] = ["CASHFREE", "RAZORPAY", "PAYTM", "PHONEPE", "PAYU"];
const FORM_ID = "payment-settings-form";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-slate-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save payment settings"}
    </button>
  );
}

function SecretField({
  label,
  name,
  clearName,
  onFile,
}: {
  label: string;
  name: string;
  clearName: string;
  onFile: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        name={name}
        type="password"
        autoComplete="new-password"
        placeholder={onFile ? "Leave blank to keep current value" : "Enter value"}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
      />
      {onFile && (
        <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
          <input type="checkbox" name={clearName} className="rounded border-slate-300" />
          Remove stored value
        </label>
      )}
    </div>
  );
}

function ModalShell({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${open ? "" : "hidden"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 text-sm shrink-0"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ProviderIcon({ id }: { id: PaymentProviderId }) {
  const wrap =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm";
  return (
    <span className={wrap}>
      <span className="text-xs font-bold tracking-tight text-indigo-700" aria-hidden>
        {id === "PHONEPE" ? "PP" : id === "PAYTM" ? "PT" : id === "PAYU" ? "PU" : id === "RAZORPAY" ? "RZ" : "CF"}
      </span>
    </span>
  );
}

function providerConfigured(id: PaymentProviderId, s: PaymentSettingsFormModel): boolean {
  if (id === "CASHFREE") return !!(s.cashfreeAppId?.trim() && s.cashfreeSecretOnFile);
  if (id === "RAZORPAY") return !!(s.razorpayKeyId?.trim() && s.razorpaySecretOnFile);
  if (id === "PAYTM") return !!(s.paytmMerchantId?.trim() && s.paytmMerchantKeyOnFile);
  if (id === "PHONEPE") return !!(s.phonepeMerchantId?.trim() && s.phonepeSaltKeyOnFile);
  if (id === "PAYU") return !!(s.payuMerchantKeyOnFile && s.payuSaltOnFile);
  return false;
}

type Props = {
  settings: PaymentSettingsFormModel;
  action: typeof updatePaymentSettings;
};

export function PaymentSettingsForm({ settings, action }: Props) {
  const initial: PaymentSettingsFormState = {};
  const [state, formAction] = useFormState(action, initial);
  useAdminFormToast(state, { successMessage: "Payment settings saved" });

  const s = settings;
  const initialProviders = useMemo(() => {
    const raw = (s.onlineProviders ?? []).filter((p): p is PaymentProviderId =>
      p === "CASHFREE" || p === "RAZORPAY" || p === "PAYTM" || p === "PHONEPE" || p === "PAYU"
    );
    return Array.from(new Set(raw));
  }, [s.onlineProviders]);

  const [activeProviders, setActiveProviders] = useState<PaymentProviderId[]>(initialProviders);
  const [addDraft, setAddDraft] = useState("");
  const [codModal, setCodModal] = useState(false);
  const [onlineModal, setOnlineModal] = useState(false);
  const [configureProvider, setConfigureProvider] = useState<PaymentProviderId | null>(null);

  const addProvider = useCallback((id: PaymentProviderId) => {
    setActiveProviders((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeProvider = useCallback((id: PaymentProviderId) => {
    setActiveProviders((prev) => prev.filter((p) => p !== id));
    setConfigureProvider((cur) => (cur === id ? null : cur));
  }, []);

  const openConfigure = useCallback((id: PaymentProviderId) => {
    setConfigureProvider(id);
  }, []);

  const closeConfigure = useCallback(() => setConfigureProvider(null), []);

  const onAddSelect = (value: string) => {
    if (value === "CASHFREE" || value === "RAZORPAY" || value === "PAYTM" || value === "PHONEPE" || value === "PAYU") {
      addProvider(value);
    }
    setAddDraft("");
  };

  return (
    <form
      id={FORM_ID}
      action={formAction}
      className="relative space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {state.error && (
        <div className="rounded-lg bg-red-50 text-red-800 text-sm px-4 py-3">{state.error}</div>
      )}

      {activeProviders.map((p) => (
        <input type="hidden" name="onlineProviders" value={p} key={p} />
      ))}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">
          Payment types to offer
        </h2>
        <p className="text-sm text-slate-600">
          Select categories to configure. Only types that are both selected and <strong>enabled</strong> appear on
          checkout.
        </p>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm cursor-pointer hover:border-slate-300">
            <input type="checkbox" name="payTypeCodSelected" defaultChecked={s.payTypeCodSelected} />
            <span>
              <span className="font-medium text-slate-900">Cash on Delivery (COD)</span>
            </span>
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm cursor-pointer hover:border-slate-300">
            <input type="checkbox" name="payTypeOnlineSelected" defaultChecked={s.payTypeOnlineSelected} />
            <span>
              <span className="font-medium text-slate-900">Online</span>
              <span className="block text-xs text-slate-500">UPI, cards, wallets, net banking</span>
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-slate-900">Cash on Delivery</p>
            <p className="text-xs text-slate-500">Collect payment when the order is delivered.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Enabled at checkout</span>
            <input
              type="checkbox"
              name="payCod"
              defaultChecked={s.payCod}
              className="h-4 w-4 rounded border-slate-300"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => setCodModal(true)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Configure COD fees &amp; rules →
        </button>
      </section>

      <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-slate-900">Online payments</p>
            <p className="text-xs text-slate-500">UPI, cards, wallets, and net banking via your providers.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Enabled at checkout</span>
            <input
              type="checkbox"
              name="payOnlineEnabled"
              defaultChecked={s.payOnlineEnabled}
              className="h-4 w-4 rounded border-slate-300"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => setOnlineModal(true)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Configure channels &amp; providers →
        </button>
      </section>

      <section>
        <label className="block text-xs font-medium text-slate-600 mb-1">Payment Instructions</label>
        <textarea name="paymentInstructions" rows={3} defaultValue={s.paymentInstructions ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </section>

      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-3">
        <Submit />
      </div>

      <ModalShell open={codModal} title="COD — fees & rules" onClose={() => setCodModal(false)}>
        <div className="space-y-4 text-sm">
          <p className="text-slate-600">
            Flat fee and/or percentage. Fee is waived when order total is at or above the threshold (optional).
          </p>
          <div>
            <label htmlFor="codFeeFlat" className="block font-medium text-slate-700 mb-1">
              Flat COD fee ({s.currencySymbol})
            </label>
            <input
              id="codFeeFlat"
              name="codFeeFlat"
              type="number"
              min={0}
              step="0.01"
              defaultValue={s.codFeeFlat}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="codFeePercent" className="block font-medium text-slate-700 mb-1">
              COD fee (% of order)
            </label>
            <input
              id="codFeePercent"
              name="codFeePercent"
              type="number"
              min={0}
              max={100}
              step="0.1"
              defaultValue={s.codFeePercent}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="codWaiveFeeAboveAmount" className="block font-medium text-slate-700 mb-1">
              Waive fee when order total ≥ ({s.currencySymbol}, optional)
            </label>
            <input
              id="codWaiveFeeAboveAmount"
              name="codWaiveFeeAboveAmount"
              type="number"
              min={0}
              step="0.01"
              defaultValue={s.codWaiveFeeAboveAmount ?? ""}
              placeholder="e.g. 2000"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <button
            type="button"
            onClick={() => setCodModal(false)}
            className="w-full rounded-full bg-slate-900 text-white py-2.5 text-sm font-medium hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </ModalShell>

      <ModalShell open={onlineModal} title="Online — channels & providers" onClose={() => setOnlineModal(false)}>
        <div className="space-y-6 text-sm">
          <div>
            <p className="font-medium text-slate-800 mb-2">Checkout channels</p>
            <p className="text-xs text-slate-500 mb-2">Shown to customers under online payment.</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="payUpi" defaultChecked={s.payUpi} />
                UPI
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="payCard" defaultChecked={s.payCard} />
                Credit / debit card
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="payWallet" defaultChecked={s.payWallet} />
                Wallets
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="payNetBanking" defaultChecked={s.payNetBanking} />
                Net banking
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="add-payment-provider" className="font-medium text-slate-800 mb-1 block">
              Add payment provider
            </label>
            <p className="text-xs text-slate-500 mb-2">Choose a provider to add. Configure keys by opening its card.</p>
            <select
              id="add-payment-provider"
              value={addDraft}
              onChange={(e) => onAddSelect(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm bg-white"
            >
              <option value="">Select provider…</option>
              {ALL_PROVIDERS.filter((p) => !activeProviders.includes(p)).map((p) => (
                <option key={p} value={p}>
                  {PROVIDER_LABELS[p]}
                </option>
              ))}
            </select>
            {activeProviders.length === ALL_PROVIDERS.length && (
              <p className="text-xs text-slate-500 mt-2">All providers are already added.</p>
            )}
          </div>

          {activeProviders.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-slate-800 text-sm">Active providers</p>
              <ul className="space-y-2">
                {activeProviders.map((id) => (
                  <li key={id}>
                    <div className="flex items-stretch gap-2 rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => openConfigure(id)}
                        className="flex flex-1 min-w-0 items-center gap-3 p-3 text-left hover:bg-white/90 transition-colors"
                      >
                        <ProviderIcon id={id} />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900">{PROVIDER_LABELS[id] ?? id}</p>
                          <p className="text-xs text-slate-500">
                            {providerConfigured(id, s) ? "Credentials on file" : "Setup required — click to add keys"}
                          </p>
                        </div>
                        <CreditCard className="h-4 w-4 text-slate-400 shrink-0" aria-hidden />
                      </button>
                      <div className="flex flex-col border-l border-slate-200 bg-white/60">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openConfigure(id);
                          }}
                          title="Integration & keys"
                          className="flex flex-1 items-center justify-center px-3 text-indigo-600 hover:bg-indigo-50"
                        >
                          <BookOpen className="h-4 w-4" aria-hidden />
                          <span className="sr-only">Integration and keys</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeProvider(id);
                          }}
                          title="Remove provider"
                          className="flex flex-1 items-center justify-center px-3 text-red-600 hover:bg-red-50 border-t border-slate-200"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          <span className="sr-only">Remove provider</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOnlineModal(false)}
            className="w-full rounded-full bg-slate-900 text-white py-2.5 text-sm font-medium hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </ModalShell>

      <div className="sr-only" aria-hidden>
        {/* Off-screen credential fields when configure modal closed (still submit with form) */}
        {activeProviders.includes("CASHFREE") && configureProvider !== "CASHFREE" && (
          <>
            <input name="cashfreeAppId" defaultValue={s.cashfreeAppId ?? ""} />
            <input name="cashfreeSecret" />
            {s.cashfreeSecretOnFile && <input type="checkbox" name="clearCashfreeSecret" />}
          </>
        )}
        {activeProviders.includes("RAZORPAY") && configureProvider !== "RAZORPAY" && (
          <>
            <input name="razorpayKeyId" defaultValue={s.razorpayKeyId ?? ""} />
            <input name="razorpaySecret" />
            {s.razorpaySecretOnFile && <input type="checkbox" name="clearRazorpaySecret" />}
          </>
        )}
        {activeProviders.includes("PAYTM") && configureProvider !== "PAYTM" && (
          <>
            <input name="paytmMerchantId" defaultValue={s.paytmMerchantId ?? ""} />
            <input name="paytmMerchantKey" />
            {s.paytmMerchantKeyOnFile && <input type="checkbox" name="clearPaytmMerchantKey" />}
          </>
        )}
        {activeProviders.includes("PHONEPE") && configureProvider !== "PHONEPE" && (
          <>
            <input name="phonepeMerchantId" defaultValue={s.phonepeMerchantId ?? ""} />
            <input name="phonepeSaltKey" />
            {s.phonepeSaltKeyOnFile && <input type="checkbox" name="clearPhonepeSaltKey" />}
          </>
        )}
        {activeProviders.includes("PAYU") && configureProvider !== "PAYU" && (
          <>
            <input name="payuMerchantKey" />
            <input name="payuSalt" />
            {s.payuMerchantKeyOnFile && <input type="checkbox" name="clearPayuMerchantKey" />}
            {s.payuSaltOnFile && <input type="checkbox" name="clearPayuSalt" />}
          </>
        )}
      </div>

      <div
        className={
          configureProvider ? "fixed inset-0 z-[60] flex items-center justify-center p-4" : "sr-only pointer-events-none"
        }
        aria-hidden={!configureProvider}
      >
        {configureProvider && (
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm pointer-events-auto"
            onClick={closeConfigure}
          />
        )}
        <div
          className={
            configureProvider
              ? "relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl pointer-events-auto"
              : ""
          }
        >
          {configureProvider === "CASHFREE" && (
            <ConfigureCashfreePanel s={s} onClose={closeConfigure} formId={FORM_ID} />
          )}
          {configureProvider === "RAZORPAY" && (
            <ConfigureRazorpayPanel s={s} onClose={closeConfigure} formId={FORM_ID} />
          )}
          {configureProvider === "PAYTM" && (
            <ConfigurePaytmPanel s={s} onClose={closeConfigure} formId={FORM_ID} />
          )}
          {configureProvider === "PHONEPE" && (
            <ConfigurePhonepePanel s={s} onClose={closeConfigure} formId={FORM_ID} />
          )}
          {configureProvider === "PAYU" && (
            <ConfigurePayuPanel s={s} onClose={closeConfigure} formId={FORM_ID} />
          )}
        </div>
      </div>
    </form>
  );
}

function ConfigureCashfreePanel({
  s,
  onClose,
  formId,
}: {
  s: PaymentSettingsFormModel;
  onClose: () => void;
  formId: string;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <ProviderIcon id="CASHFREE" />
          <h3 className="text-lg font-semibold text-slate-900">{providerIntegrationTitle("CASHFREE")}</h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 text-sm shrink-0">
          Close
        </button>
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 mb-6 max-h-[38vh] overflow-y-auto">
        <ProviderIntegrationGuideBody provider="CASHFREE" />
        <a
          href={providerIntegrationDocUrl("CASHFREE")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Open official docs →
        </a>
      </div>
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <p className="text-sm font-medium text-slate-800">API credentials</p>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">App ID (public)</label>
          <input
            form={formId}
            name="cashfreeAppId"
            defaultValue={s.cashfreeAppId ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
          />
        </div>
        <SecretField label="Secret key (server-only)" name="cashfreeSecret" clearName="clearCashfreeSecret" onFile={s.cashfreeSecretOnFile} />
      </div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" form={formId} className="rounded-full bg-indigo-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-indigo-700">
          Save &amp; enable
        </button>
      </div>
    </>
  );
}

function ConfigureRazorpayPanel({
  s,
  onClose,
  formId,
}: {
  s: PaymentSettingsFormModel;
  onClose: () => void;
  formId: string;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <ProviderIcon id="RAZORPAY" />
          <h3 className="text-lg font-semibold text-slate-900">{providerIntegrationTitle("RAZORPAY")}</h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 text-sm shrink-0">
          Close
        </button>
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 mb-6 max-h-[38vh] overflow-y-auto">
        <ProviderIntegrationGuideBody provider="RAZORPAY" />
        <a
          href={providerIntegrationDocUrl("RAZORPAY")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Open official docs →
        </a>
      </div>
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <p className="text-sm font-medium text-slate-800">API credentials</p>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Key ID (public)</label>
          <input
            form={formId}
            name="razorpayKeyId"
            defaultValue={s.razorpayKeyId ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
          />
        </div>
        <SecretField label="Key Secret (server-only)" name="razorpaySecret" clearName="clearRazorpaySecret" onFile={s.razorpaySecretOnFile} />
      </div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" form={formId} className="rounded-full bg-indigo-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-indigo-700">
          Save &amp; enable
        </button>
      </div>
    </>
  );
}

function ConfigurePaytmPanel({
  s,
  onClose,
  formId,
}: {
  s: PaymentSettingsFormModel;
  onClose: () => void;
  formId: string;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <ProviderIcon id="PAYTM" />
          <h3 className="text-lg font-semibold text-slate-900">{providerIntegrationTitle("PAYTM")}</h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 text-sm shrink-0">
          Close
        </button>
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 mb-6 max-h-[38vh] overflow-y-auto">
        <ProviderIntegrationGuideBody provider="PAYTM" />
        <a
          href={providerIntegrationDocUrl("PAYTM")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Open official docs →
        </a>
      </div>
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <p className="text-sm font-medium text-slate-800">API credentials</p>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Merchant ID</label>
          <input
            form={formId}
            name="paytmMerchantId"
            defaultValue={s.paytmMerchantId ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
          />
        </div>
        <SecretField label="Merchant Key (server-only)" name="paytmMerchantKey" clearName="clearPaytmMerchantKey" onFile={s.paytmMerchantKeyOnFile} />
      </div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" form={formId} className="rounded-full bg-indigo-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-indigo-700">
          Save &amp; enable
        </button>
      </div>
    </>
  );
}

function ConfigurePhonepePanel({
  s,
  onClose,
  formId,
}: {
  s: PaymentSettingsFormModel;
  onClose: () => void;
  formId: string;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <ProviderIcon id="PHONEPE" />
          <h3 className="text-lg font-semibold text-slate-900">{providerIntegrationTitle("PHONEPE")}</h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 text-sm shrink-0">
          Close
        </button>
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 mb-6 max-h-[38vh] overflow-y-auto">
        <ProviderIntegrationGuideBody provider="PHONEPE" />
        <a
          href={providerIntegrationDocUrl("PHONEPE")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Open official docs →
        </a>
      </div>
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <p className="text-sm font-medium text-slate-800">API credentials</p>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Merchant ID</label>
          <input
            form={formId}
            name="phonepeMerchantId"
            defaultValue={s.phonepeMerchantId ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
          />
        </div>
        <SecretField label="Salt Key (server-only)" name="phonepeSaltKey" clearName="clearPhonepeSaltKey" onFile={s.phonepeSaltKeyOnFile} />
      </div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" form={formId} className="rounded-full bg-indigo-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-indigo-700">
          Save &amp; enable
        </button>
      </div>
    </>
  );
}

function ConfigurePayuPanel({
  s,
  onClose,
  formId,
}: {
  s: PaymentSettingsFormModel;
  onClose: () => void;
  formId: string;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <ProviderIcon id="PAYU" />
          <h3 className="text-lg font-semibold text-slate-900">{providerIntegrationTitle("PAYU")}</h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 text-sm shrink-0">
          Close
        </button>
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 mb-6 max-h-[38vh] overflow-y-auto">
        <ProviderIntegrationGuideBody provider="PAYU" />
        <a
          href={providerIntegrationDocUrl("PAYU")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Open official docs →
        </a>
      </div>
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <p className="text-sm font-medium text-slate-800">API credentials</p>
        <SecretField label="Merchant Key (server-only)" name="payuMerchantKey" clearName="clearPayuMerchantKey" onFile={s.payuMerchantKeyOnFile} />
        <SecretField label="Salt (server-only)" name="payuSalt" clearName="clearPayuSalt" onFile={s.payuSaltOnFile} />
      </div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" form={formId} className="rounded-full bg-indigo-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-indigo-700">
          Save &amp; enable
        </button>
      </div>
    </>
  );
}

"use client";

const DOC_LINKS = {
  STRIPE: "https://stripe.com/docs/payments/checkout",
  RAZORPAY: "https://razorpay.com/docs/payments/server-integration/nodejs/payment-gateway/",
  CASHFREE: "https://www.cashfree.com/docs/api-reference/payments/latest/payments/pg",
  PAYTM: "https://business.paytm.com/docs/all-in-one-sdk/hybrid-apps/web/",
  PHONEPE: "https://developer.phonepe.com/v4/docs",
  PAYU: "https://docs.payu.in/reference",
} as const;

export type PaymentProviderId = keyof typeof DOC_LINKS;

type Provider = PaymentProviderId;

const bodies: Record<Provider, React.ReactNode> = {
  STRIPE: (
    <div className="space-y-4 text-sm text-slate-700">
      <p>
        Stripe Checkout or Payment Element collects card/UPI (region-dependent) on Stripe-hosted or embedded UI. Your
        server creates a <strong>PaymentIntent</strong> or Checkout <strong>Session</strong> with the{" "}
        <strong>secret</strong> key, then the client confirms with the <strong>publishable</strong> key.
      </p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Create a Stripe account and get test/live API keys from the Dashboard.</li>
        <li>
          Save the publishable key and secret key below. The secret stays in MongoDB and is used only on the server
          (same database as the storefront).
        </li>
        <li>
          Publishable key is exposed to the browser via <code className="text-xs">/api/company-settings</code>; secret
          never is.
        </li>
        <li>
          Storefront: <code className="text-xs">POST /api/payments/session</code> creates a Checkout Session; after
          redirect, <code className="text-xs">POST /api/payments/verify</code> confirms <code className="text-xs">paid</code>{" "}
          before marking the order paid. Add webhooks in production for redundancy.
        </li>
      </ol>
      <p className="text-xs text-slate-500">Required: keys saved below, HTTPS in production; webhooks recommended.</p>
    </div>
  ),
  RAZORPAY: (
    <div className="space-y-4 text-sm text-slate-700">
      <p>
        Razorpay Standard Checkout opens a modal or hosted page. You create an <strong>order</strong> on the server
        with <code className="bg-slate-100 px-1 rounded text-xs">key_id</code> +{" "}
        <code className="text-xs">key_secret</code>, return <code className="text-xs">order_id</code> to the client,
        then verify the <code className="text-xs">razorpay_payment_id</code> + signature on the server.
      </p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Sign up at Razorpay Dashboard → API keys: Key ID (public) and Key Secret (private).</li>
        <li>Save Key ID and Key Secret below (secret stays in the database, server-only).</li>
        <li>
          On payment success, verify signature:{" "}
          <code className="text-xs bg-slate-100 px-1 rounded">crypto.createHmac(&quot;sha256&quot;, secret)</code> with{" "}
          <code className="text-xs">order_id|payment_id</code>.
        </li>
        <li>
          Storefront verifies via <code className="text-xs">POST /api/payments/verify</code> (signature + payment fetch)
          after Razorpay Checkout succeeds.
        </li>
        <li>Configure Razorpay webhooks for <code className="text-xs">payment.captured</code> as a backup.</li>
      </ol>
      <p className="text-xs text-slate-500">Required: Key ID and secret below; webhooks optional.</p>
    </div>
  ),
  CASHFREE: (
    <div className="space-y-4 text-sm text-slate-700">
      <p>Use Cashfree App ID + Secret key for server-side API calls.</p>
      <p className="text-xs text-slate-500">For this setup, use provider id and secret credentials only.</p>
    </div>
  ),
  PAYTM: (
    <div className="space-y-4 text-sm text-slate-700">
      <p>Use Paytm MID and Merchant Key for server-side integration.</p>
      <p className="text-xs text-slate-500">Save Merchant ID and Merchant Key in Admin payment settings.</p>
    </div>
  ),
  PHONEPE: (
    <div className="space-y-4 text-sm text-slate-700">
      <p>Use PhonePe Merchant ID and Salt Key for server-side integration.</p>
      <p className="text-xs text-slate-500">Save Merchant ID and Salt Key in Admin payment settings.</p>
    </div>
  ),
  PAYU: (
    <div className="space-y-4 text-sm text-slate-700">
      <p>Use PayU Merchant Key and Salt for server-side integration.</p>
      <p className="text-xs text-slate-500">Save Merchant Key and Salt in Admin payment settings.</p>
    </div>
  ),
};

const titles: Record<Provider, string> = {
  STRIPE: "Stripe — integration & keys",
  RAZORPAY: "Razorpay — integration & keys",
  CASHFREE: "Cashfree — integration & keys",
  PAYTM: "Paytm — integration & keys",
  PHONEPE: "PhonePe — integration & keys",
  PAYU: "PayU — integration & keys",
};

export function providerIntegrationTitle(p: PaymentProviderId): string {
  return titles[p];
}

export function providerIntegrationDocUrl(p: PaymentProviderId): string {
  return DOC_LINKS[p];
}

export function ProviderIntegrationGuideBody({ provider }: { provider: PaymentProviderId }) {
  return bodies[provider];
}

/** Standalone docs-only modal (optional). */
export function ProviderIntegrationGuide({
  provider,
  onClose,
}: {
  provider: PaymentProviderId | null;
  onClose: () => void;
}) {
  if (!provider) return null;
  const doc = DOC_LINKS[provider];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="integration-guide-title"
    >
      <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 id="integration-guide-title" className="text-lg font-semibold text-slate-900 pr-8">
            {titles[provider]}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
        {bodies[provider]}
        <a
          href={doc}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Open official docs →
        </a>
      </div>
    </div>
  );
}

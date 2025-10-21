import { SEO } from "@/components/SEO";
import { LegalLayout } from "@/components/LegalLayout";

const LAST_UPDATED = "8 October 2025";

export default function Refund() {
  return (
    <LegalLayout>
      <SEO
        title="Refund & Cancellation Policy | QuotientOne"
        description="Manual recharge model, non-refundable payments, plan expiry, and support guidance for QuotientOne."
        canonical={window.location.href}
      />
      <article className="prose prose-slate max-w-none">
        <h1>Refund &amp; Cancellation Policy</h1>
        <p className="text-sm text-slate-500">Last Updated: {LAST_UPDATED}</p>
        <hr />

        <h2>1. Free Trial</h2>
        <p>
          We may offer a free trial or limited features so you can evaluate the Service before purchase. No payment is
          charged unless you upgrade.
        </p>

        <h2>2. Payment Model (Manual Recharge)</h2>
        <ul>
          <li><strong>No auto-renewal:</strong> QuotientOne operates on a manual recharge basis.</li>
          <li>You must initiate payment each cycle (monthly/quarterly/yearly) to continue premium access.</li>
          <li>When your plan expires, your account returns to the free tier unless you recharge again.</li>
        </ul>

        <h2>3. Non-Refundable Payments</h2>
        <p>
          All payments are <strong>final and non-refundable</strong> once processed, except in cases of proven
          technical error (e.g., you were charged but premium access was not activated).
        </p>
        <p>Refunds will not be issued for change of mind, unused time, partial periods, or incorrect plan selection.</p>

        <h2>4. Plan Expiry &amp; Renewal</h2>
        <ul>
          <li>Plans end automatically at term expiry.</li>
          <li>To continue premium access, complete a new manual recharge.</li>
          <li>Expired accounts keep limited (free-tier) access.</li>
        </ul>

        <h2>5. Cancellations</h2>
        <p>Because there is no auto-renewal, cancellation simply means you do not recharge after your term ends.</p>

        <h2>6. Processing Time for Exceptions</h2>
        <p>If a refund exception is approved, it is typically processed within <strong>5–10 business days</strong> back to the original payment method.</p>

        <h2>7. Support</h2>
        <p>For billing issues or to report a technical error, contact <a href="mailto:support@quotientone.cloud">support@quotientone.cloud</a>.</p>
      </article>
    </LegalLayout>
  );
}

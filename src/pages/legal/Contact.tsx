import { SEO } from "@/components/SEO";
import { LegalLayout } from "@/components/LegalLayout";

export default function Contact() {
  return (
    <LegalLayout>
      <SEO
        title="Contact Us | QuotientOne"
        description="Contact information for QuotientOne support and compliance requests."
        canonical={window.location.href}
      />
      <article className="prose prose-slate max-w-none">
        <h1>Contact Us</h1>
        <p className="text-sm text-slate-500">For support, privacy requests, and billing questions.</p>
        <hr />

        <h2>Support</h2>
        <p>Email: <a href="mailto:support@quotientone.cloud">support@quotientone.cloud</a></p>

        <h2>Company</h2>
        <p><strong>QuotientOne</strong><br />India (primary jurisdiction) — serving UAE, US, and EU customers.</p>

        <h2>Requests</h2>
        <ul>
          <li>Privacy/Data Subject Requests (GDPR/CCPA): <a href="mailto:support@quotientone.cloud">support@quotientone.cloud</a></li>
          <li>Billing/Invoice/Refund Exception Queries: <a href="mailto:support@quotientone.cloud">support@quotientone.cloud</a></li>
          <li>IP/DMCA Notices: Subject “DMCA Request” to <a href="mailto:support@quotientone.cloud">support@quotientone.cloud</a></li>
        </ul>
      </article>
    </LegalLayout>
  );
}

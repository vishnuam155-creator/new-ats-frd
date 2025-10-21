import { SEO } from "@/components/SEO";
import { LegalLayout } from "@/components/LegalLayout";

const LAST_UPDATED = "8 October 2025";

export default function Terms() {
  return (
    <LegalLayout>
      <SEO
        title="Terms of Service | QuotientOne"
        description="Terms of Service for QuotientOne, an online resume creation and document upload SaaS."
        canonical={window.location.href}
      />
      <article className="prose prose-slate max-w-none">
        <h1>Terms of Service</h1>
        <p className="text-sm text-slate-500">Last Updated: {LAST_UPDATED}</p>
        <hr />

        <h2>1. Introduction</h2>
        <p>
          Welcome to <strong>QuotientOne</strong> (“we”, “our”, “us”). These Terms
          govern your access to and use of our website, applications, and services
          (the “Service”). By using the Service, you agree to these Terms.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          QuotientOne provides online resume creation tools, document uploads, AI-assisted
          content generation, and related productivity features offered via a SaaS model.
        </p>

        <h2>3. Eligibility</h2>
        <p>You must be at least 18 years old and able to form a binding contract.</p>

        <h2>4. Account Registration</h2>
        <ul>
          <li>Provide accurate, current, and complete information.</li>
          <li>You are responsible for safeguarding your login credentials.</li>
        </ul>

        <h2>5. Payment & Plans</h2>
        <ul>
          <li>Paid features require valid payment via secure processors (Stripe, Razorpay, PayPal).</li>
          <li>Prices may be in INR, AED, USD, or EUR and may include taxes.</li>
          <li>
            Unless otherwise stated, our model is <strong>manual recharge</strong> (no automatic
            renewal). See our <a href="/legal/refund">Refund &amp; Cancellation Policy</a>.
          </li>
        </ul>

        <h2>6. User Content & License</h2>
        <p>
          You retain ownership of content you upload (e.g., resumes, job descriptions).
          You grant QuotientOne a limited, non-exclusive, revocable license to process
          such content solely to provide and improve the Service.
        </p>

        <h2>7. Intellectual Property</h2>
        <p>
          All Service materials (templates, UI, software, branding) are owned by QuotientOne
          or its licensors and protected by IP laws. You may not copy, resell, or create
          derivative works without written permission.
        </p>

        <h2>8. Prohibited Uses</h2>
        <ul>
          <li>Uploading unlawful, infringing, or harmful content.</li>
          <li>Reverse engineering, scraping, or interfering with security.</li>
          <li>Using generated content to deceive or commit fraud.</li>
        </ul>

        <h2>9. Termination & Suspension</h2>
        <p>We may suspend or terminate access for breaches, suspected fraud, or security risks.</p>

        <h2>10. Disclaimers</h2>
        <p>
          The Service is provided “as is” and “as available.” We do not guarantee job placement,
          interview outcomes, or that generated content is error-free or fit for a particular purpose.
        </p>

        <h2>11. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, QuotientOne is not liable for indirect, incidental,
          consequential, special, or punitive damages, or for lost profits, revenues, data, or business opportunities.
        </p>

        <h2>12. Indemnification</h2>
        <p>You agree to indemnify and hold us harmless from claims arising from your misuse of the Service.</p>

        <h2>13. International Use</h2>
        <p>
          Primary jurisdiction is India. Users from the UAE, US, and EU are responsible for compliance with
          applicable local laws.
        </p>

        <h2>14. Governing Law & Dispute Resolution</h2>
        <p>
          These Terms are governed by the laws of India. Courts in India (competent jurisdiction) shall have
          exclusive jurisdiction, subject to any mandatory consumer protection laws in your country.
        </p>

        <h2>15. Changes</h2>
        <p>We may update these Terms; continued use after changes indicates acceptance.</p>

        <h2>16. Contact</h2>
        <p>Email: <a href="mailto:support@quotientone.cloud">support@quotientone.cloud</a></p>
      </article>
    </LegalLayout>
  );
}

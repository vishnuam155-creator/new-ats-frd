import { SEO } from "@/components/SEO";
import { LegalLayout } from "@/components/LegalLayout";

const LAST_UPDATED = "8 October 2025";

export default function Privacy() {
  return (
    <LegalLayout>
      <SEO
        title="Privacy Policy | QuotientOne"
        description="Privacy Policy for QuotientOne, covering data collection, usage, transfers, security, and user rights (GDPR/CCPA)."
        canonical={window.location.href}
      />
      <article className="prose prose-slate max-w-none">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last Updated: {LAST_UPDATED}</p>
        <hr />

        <h2>1. Who We Are</h2>
        <p>
          <strong>QuotientOne</strong> provides online resume creation and AI-assisted tools.
          Contact: <a href="mailto:support@quotientone.cloud">support@quotientone.cloud</a>.
        </p>

        <h2>2. Data We Collect</h2>
        <ul>
          <li><strong>Personal Data:</strong> name, email, billing details (processed by Stripe, Razorpay, PayPal).</li>
          <li><strong>Content Data:</strong> uploaded resumes, job descriptions, profile inputs.</li>
          <li><strong>Usage &amp; Technical Data:</strong> IP address, device/browser info, logs, analytics, cookies/pixels.</li>
        </ul>

        <h2>3. How We Use Data</h2>
        <ul>
          <li>Provide, maintain, and improve the Service and features.</li>
          <li>Process payments and prevent fraud.</li>
          <li>Communicate updates, transactional emails, and support.</li>
          <li>Comply with legal obligations and enforce terms.</li>
        </ul>

        <h2>4. Legal Bases (GDPR)</h2>
        <ul>
          <li>Performance of a contract.</li>
          <li>Legitimate interests (security, analytics, product improvement).</li>
          <li>Consent (marketing cookies/communications where required).</li>
          <li>Legal obligations (tax, accounting, compliance).</li>
        </ul>

        <h2>5. Sharing &amp; Disclosure</h2>
        <p>
          We share data with vetted processors for payments, hosting, analytics, and customer support. We do not sell
          personal information. We may disclose information to comply with law or protect rights, safety, and security.
        </p>

        <h2>6. International Transfers</h2>
        <p>
          Your data may be processed in India, UAE, US, EU, and other locations. We use appropriate safeguards
          (e.g., Standard Contractual Clauses) and technical controls (TLS, access controls).
        </p>

        <h2>7. Retention</h2>
        <p>
          We retain data as long as your account is active or as needed to provide the Service and meet legal obligations.
          You may request deletion (see “Your Rights”).
        </p>

        <h2>8. Your Rights</h2>
        <ul>
          <li><strong>Access/Correction/Deletion</strong></li>
          <li><strong>Portability</strong></li>
          <li><strong>Objection/Restriction</strong></li>
          <li><strong>Consent Withdrawal</strong></li>
          <li><strong>CCPA/CPRA</strong>: right to know, delete, and non-discrimination; “Do Not Sell or Share” where applicable.</li>
        </ul>
        <p>
          Contact <a href="mailto:support@quotientone.cloud">support@quotientone.cloud</a>. We may verify identity before processing requests.
        </p>

        <h2>9. Cookies &amp; Tracking</h2>
        <p>
          We use essential, analytics, and marketing cookies/pixels. Manage preferences via our Cookie banner and your
          browser settings. See our <a href="/legal/cookies">Cookie Policy</a>.
        </p>

        <h2>10. Security</h2>
        <p>We implement TLS, access controls, monitoring, and organizational measures. No system is 100% secure.</p>

        <h2>11. Children</h2>
        <p>The Service is not directed to children under 18. We do not knowingly collect data from minors.</p>

        <h2>12. Changes</h2>
        <p>We may update this policy; material changes will be notified via the Service or email.</p>

        <h2>13. Contact</h2>
        <p>Email: <a href="mailto:support@quotientone.cloud">support@quotientone.cloud</a></p>
      </article>
    </LegalLayout>
  );
}

import { SEO } from "@/components/SEO";
import { LegalLayout } from "@/components/LegalLayout";

const LAST_UPDATED = "8 October 2025";

export default function Cookies() {
  return (
    <LegalLayout>
      <SEO
        title="Cookie Policy | QuotientOne"
        description="Cookie Policy for QuotientOne explaining types of cookies used and how to manage preferences."
        canonical={window.location.href}
      />
      <article className="prose prose-slate max-w-none">
        <h1>Cookie Policy</h1>
        <p className="text-sm text-slate-500">Last Updated: {LAST_UPDATED}</p>
        <hr />

        <h2>1. What Are Cookies?</h2>
        <p>Cookies are small text files stored on your device to remember preferences and enhance experiences.</p>

        <h2>2. Types of Cookies We Use</h2>
        <ul>
          <li><strong>Essential:</strong> authentication, session management, security.</li>
          <li><strong>Analytics:</strong> usage statistics, performance (e.g., Google Analytics).</li>
          <li><strong>Marketing:</strong> ad measurement and remarketing (e.g., Google Ads, Meta Pixel).</li>
        </ul>

        <h2>3. Managing Cookies</h2>
        <p>
          Use our in-site <strong>Cookie Preferences</strong> banner to opt-in/opt-out where required. You can also
          manage cookies via your browser settings.
        </p>

        <h2>4. Third-Party Cookies</h2>
        <p>Some cookies are set by third parties (analytics/ads). Review their privacy policies for details.</p>

        <h2>5. More Information</h2>
        <p>
          See our <a href="/legal/privacy">Privacy Policy</a> for how we process data collected via cookies.
        </p>

        <h2>6. Contact</h2>
        <p>Email: <a href="mailto:support@quotientone.cloud">support@quotientone.cloud</a></p>
      </article>
    </LegalLayout>
  );
}

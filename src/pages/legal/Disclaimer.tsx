import { SEO } from "@/components/SEO";
import { LegalLayout } from "@/components/LegalLayout";

const LAST_UPDATED = "8 October 2025";

export default function Disclaimer() {
  return (
    <LegalLayout>
      <SEO
        title="Disclaimer | QuotientOne"
        description="Disclaimer for QuotientOne regarding AI-generated content and employment outcomes."
        canonical={window.location.href}
      />
      <article className="prose prose-slate max-w-none">
        <h1>Disclaimer</h1>
        <p className="text-sm text-slate-500">Last Updated: {LAST_UPDATED}</p>
        <hr />
        <p>
          QuotientOne provides tools to help you create and format resumes, along with AI-assisted suggestions. While we
          aim for accuracy and usefulness, all outputs are provided for informational purposes only and should be
          reviewed and verified by you.
        </p>
        <ul>
          <li>We do not guarantee job placement, interview invitations, or employment outcomes.</li>
          <li>AI-generated content may contain inaccuracies; you are responsible for reviewing and editing prior to use.</li>
          <li>Advice or recommendations are not legal, financial, or professional advice.</li>
        </ul>
        <p>For questions, contact <a href="mailto:support@quotientone.cloud">support@quotientone.cloud</a>.</p>
      </article>
    </LegalLayout>
  );
}

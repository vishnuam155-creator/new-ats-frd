import { SEO } from "@/components/SEO";
import { LegalLayout } from "@/components/LegalLayout";

const LAST_UPDATED = "8 October 2025";

export default function Copyright() {
  return (
    <LegalLayout>
      <SEO
        title="Copyright & IP Policy | QuotientOne"
        description="IP ownership, permitted use, and DMCA-style takedown process for QuotientOne."
        canonical={window.location.href}
      />
      <article className="prose prose-slate max-w-none">
        <h1>Copyright &amp; Intellectual Property Policy</h1>
        <p className="text-sm text-slate-500">Last Updated: {LAST_UPDATED}</p>
        <hr />

        <h2>1. Ownership</h2>
        <p>
          All Service content, including templates, UI, software code, graphics, and brand assets, is owned by
          <strong> QuotientOne</strong> or its licensors and protected by applicable IP laws.
        </p>

        <h2>2. Permitted Use</h2>
        <p>Subject to the Terms of Service, we grant you a limited, non-exclusive license to use the Service solely for creating and managing your own resume and related documents.</p>

        <h2>3. Prohibited Use</h2>
        <ul>
          <li>Copying, distributing, reselling, or publicly displaying templates or code.</li>
          <li>Reverse engineering or creating derivative works without permission.</li>
        </ul>

        <h2>4. User Content</h2>
        <p>You retain ownership of your uploaded content. You grant QuotientOne a limited license to process your content solely to provide the Service.</p>

        <h2>5. Infringement Notices</h2>
        <p>
          If you believe your copyright is infringed on the Service, contact{" "}
          <a href="mailto:support@quotientone.cloud">support@quotientone.cloud</a> with the subject “DMCA Request” and include:
        </p>
        <ul>
          <li>Identification of the copyrighted work and infringing material;</li>
          <li>Your contact details and a statement of good-faith belief;</li>
          <li>A statement that the notice is accurate, and you are authorized to act on behalf of the owner.</li>
        </ul>
      </article>
    </LegalLayout>
  );
}

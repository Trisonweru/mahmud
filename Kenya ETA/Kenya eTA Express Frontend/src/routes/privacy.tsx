import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { CONTACT } from "@/lib/site-contact";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Kenya eTA Application Service" },
      {
        name: "description",
        content:
          "How Kenyaevisa.net collects, uses and protects your personal data when you apply for a Kenya eTA.",
      },
      { property: "og:title", content: "Privacy Policy" },
      {
        property: "og:description",
        content: "How we collect, use and protect your data when you apply for a Kenya eTA.",
      },
      { property: "og:url", content: absoluteUrl("/privacy") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/privacy") }],
  }),
  component: Privacy,
});

const linkClass = "text-primary underline decoration-dotted hover:text-foreground";

function Privacy() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" description="Last updated 8 September 2026" />
      <Section className="max-w-3xl">
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <p>
            This Privacy Policy explains how <strong className="text-foreground">Kenyaevisa.net</strong>{" "}
            ("we," "us," or "our") collects, uses, and protects your personal information when you
            use our website and related application assistance services ("Services"). By using our
            website, you agree to the practices described here.
          </p>

          <Block n="1" title="Data Controller">
            <strong className="text-foreground">Kenyaevisa.net</strong> — a trading name of
            Passkey Technologies Limited, registered in England &amp; Wales (Company No.
            16877709), registered office: {CONTACT.addressLines.join(", ")}. We are an independent
            third-party service provider and are not affiliated with, endorsed by, or connected to
            the Government of Kenya or any of its departments.
          </Block>

          <Block n="2" title="Information We Collect">
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong className="text-foreground">Personal identifiers:</strong> full name, date
                of birth, nationality
              </li>
              <li>
                <strong className="text-foreground">Passport details:</strong> passport number,
                country, issue &amp; expiry date
              </li>
              <li>
                <strong className="text-foreground">Special category / biometric data:</strong>{" "}
                passport photo / scan
              </li>
              <li>
                <strong className="text-foreground">Contact information:</strong> email address,
                phone number
              </li>
              <li>
                <strong className="text-foreground">Trip details:</strong> reason for travel and
                the supporting documents relevant to it (such as accommodation booking, airline
                booking, or an invitation letter)
              </li>
              <li>
                <strong className="text-foreground">Technical data:</strong> IP address, browser
                type (collected automatically)
              </li>
            </ul>
          </Block>

          <Block n="3" title="How We Use Your Data (Lawful Basis)">
            We process your data under the UK General Data Protection Regulation (UK GDPR):
            <ul className="list-disc space-y-1 pl-6 mt-2">
              <li>
                <strong className="text-foreground">Contract performance:</strong> to prepare and
                submit your eTA application to the official Kenya eTA portal.
              </li>
              <li>
                <strong className="text-foreground">Explicit consent:</strong> for processing your
                passport photo (special category / biometric data).
              </li>
              <li>
                <strong className="text-foreground">Legitimate interests:</strong> for customer
                support, fraud prevention, and service improvement.
              </li>
            </ul>
          </Block>

          <Block n="4" title="International Data Transfers">
            Your application data (including passport details and photo) is transferred to the
            Government of Kenya, via the official Kenya eTA portal, for processing your
            application.
          </Block>

          <Block n="5" title="Who We Share Your Data With">
            <ul className="list-disc space-y-1 pl-6">
              <li>The Government of Kenya, via the official eTA portal — to process your application</li>
              <li>Our payment provider — to process your application fee payment</li>
              <li>Trusted service providers who assist us, under strict confidentiality agreements</li>
            </ul>
            We do not sell, trade, or rent your personal data to third parties.
          </Block>

          <Block n="6" title="Data Retention">
            <ul className="list-disc space-y-1 pl-6">
              <li>Passport images and application documents are deleted within 7 days of submission to the official eTA portal.</li>
              <li>Transaction records are retained for up to 7 years as required by UK law.</li>
            </ul>
          </Block>

          <Block n="7" title="Your Rights under UK GDPR">
            You have the right to access, correct, request deletion of, object to or restrict
            processing, and withdraw consent for your data. Contact us at{" "}
            <a href={`mailto:${CONTACT.email}`} className={linkClass}>
              {CONTACT.email}
            </a>
            . You may also lodge a complaint with the Information Commissioner's Office (ICO).
          </Block>

          <Block n="8" title="Cookies & Tracking">
            We use essential cookies to ensure the website functions properly. We do not use
            non-essential tracking cookies without your consent.
          </Block>

          <Block n="9" title="Updates to This Policy">
            We may update this Privacy Policy from time to time. The latest version will be posted
            on this page with an updated date.
          </Block>

          <div className="border-t border-border pt-8 text-center">
            <h2 className="font-display text-xl font-semibold text-foreground">Contact us</h2>
            <p className="mt-3">
              Email:{" "}
              <a href={`mailto:${CONTACT.email}`} className={linkClass}>
                {CONTACT.email}
              </a>
              <br />
              Registered office: {CONTACT.addressLines.join(", ")}
              <br />
              Passkey Technologies Limited (trading as Kenyaevisa.net) · Company No. 16877709
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            See also:{" "}
            <Link to="/terms" className={linkClass}>
              Terms of Service
            </Link>{" "}
            ·{" "}
            <Link to="/refund" className={linkClass}>
              Refund Policy
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}

function Block({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-foreground">
        {n}. {title}
      </h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

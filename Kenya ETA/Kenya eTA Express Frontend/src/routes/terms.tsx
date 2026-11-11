import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { CONTACT } from "@/lib/site-contact";
import { absoluteUrl } from "@/lib/seo";
import { EXPRESS_FEE, TOTAL_FEE, TRANSIT_FEE, money } from "@/lib/eta-pricing";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Kenya eTA Application Service" },
      {
        name: "description",
        content:
          "Read the terms and conditions governing use of the Kenya eTA application assistance service.",
      },
      { property: "og:title", content: "Terms of Service" },
      {
        property: "og:description",
        content: "Terms and conditions for using our Kenya eTA application assistance service.",
      },
      { property: "og:url", content: absoluteUrl("/terms") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/terms") }],
  }),
  component: Terms,
});

const linkClass = "text-primary underline decoration-dotted hover:text-foreground";

function Terms() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Service" description="Last updated 8 September 2026" />
      <Section className="max-w-3xl">
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <Block n="1" title="Service Provider">
            This service is provided by <strong className="text-foreground">Kenyaevisa.net</strong>{" "}
            ("we," "us," or "our"), a trading name of Passkey Technologies Limited, registered in
            England &amp; Wales (Company No. 16877709), registered office:{" "}
            {CONTACT.addressLines.join(", ")}. We are an independent third-party service and are
            not affiliated with, endorsed by, or part of the Government of Kenya, the Directorate
            of Immigration Services, or the official eTA portal at{" "}
            <a href="https://www.etakenya.go.ke" className={linkClass} target="_blank" rel="noopener noreferrer">
              etakenya.go.ke
            </a>
            . We offer paid assistance to help you prepare and submit your Kenya eTA application
            through that official portal.
          </Block>

          <Block n="2" title="Service Fee">
            We charge a single, all-inclusive fee per applicant, which covers our guided
            application form, manual review of your details and documents, submission on the
            official eTA portal on your behalf, and support until a decision is issued:
            <ul className="list-disc space-y-1 pl-6 mt-2">
              <li>
                <strong className="text-foreground">Standard — {money(TOTAL_FEE)} USD</strong>{" "}
                (Tourism or Friends and Family, decision normally within 3 business days)
              </li>
              <li>
                <strong className="text-foreground">Transit — {money(TRANSIT_FEE)} USD</strong>{" "}
                (for travellers passing through Kenya)
              </li>
              <li>
                <strong className="text-foreground">Express — {money(EXPRESS_FEE)} USD</strong>{" "}
                (priority handling, decision typically within 5–6 hours during working hours)
              </li>
            </ul>
            The fee is quoted and charged as a single all-inclusive amount; we do not itemise it
            further. See our{" "}
            <Link to="/refund" className={linkClass}>
              Refund Policy
            </Link>{" "}
            for when refunds apply.
          </Block>

          <Block n="3" title="Refund Policy">
            Refunds are governed by our separate{" "}
            <Link to="/refund" className={linkClass}>
              Refund Policy
            </Link>
            . No refunds are available except as expressly stated in that policy.
          </Block>

          <Block n="4" title="No Guarantee of Approval">
            We do <strong className="text-foreground">not</strong> guarantee approval of your
            application or entry into Kenya. All decisions are made solely by the Government of
            Kenya through the official eTA system.
          </Block>

          <Block n="5" title="Your Responsibilities">
            You agree to:
            <ul className="list-disc space-y-1 pl-6 mt-2">
              <li>Provide accurate, complete, and truthful information.</li>
              <li>Upload valid and legible supporting documents.</li>
              <li>Review your application before submission.</li>
            </ul>
            We are not liable for application rejections, delays, or entry denials resulting from
            errors, omissions, or false information provided by you.
          </Block>

          <Block n="6" title="Cancellation Rights">
            By proceeding with payment, you request immediate performance of our service. You will
            be required to confirm that you request immediate performance of services before
            completing payment. Once your application has been submitted to the official eTA
            portal, you waive any right of withdrawal under the UK Consumer Rights Act 2015 and
            the fee becomes non-refundable, except as set out in our{" "}
            <Link to="/refund" className={linkClass}>
              Refund Policy
            </Link>
            .
          </Block>

          <Block n="7" title="Data Protection">
            Your personal data is handled in accordance with our{" "}
            <Link to="/privacy" className={linkClass}>
              Privacy Policy
            </Link>{" "}
            and applicable UK data protection law.
          </Block>

          <Block n="8" title="Limitation of Liability">
            Our total liability for any claim arising from the use of our services is limited to
            the total fee you paid us for the affected application. We are not liable for:
            <ul className="list-disc space-y-1 pl-6 mt-2">
              <li>Refusals or entry denials by Kenyan authorities</li>
              <li>Travel disruptions, financial losses, or consequential damages</li>
              <li>Changes in government policy or processing delays</li>
            </ul>
          </Block>

          <Block n="9" title="Governing Law">
            These Terms are governed by and construed in accordance with the laws of England and
            Wales. Any disputes are subject to the exclusive jurisdiction of the courts of England
            and Wales.
          </Block>

          <Block n="10" title="Changes to These Terms">
            We may update these Terms from time to time. The latest version will be posted on this
            page with an updated date. Continued use of our service constitutes acceptance.
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
            <Link to="/privacy" className={linkClass}>
              Privacy Policy
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { CONTACT } from "@/lib/site-contact";
import { absoluteUrl } from "@/lib/seo";
import { EXPRESS_FEE, TOTAL_FEE, TRANSIT_FEE, money } from "@/lib/eta-pricing";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Kenya eTA Application Service" },
      {
        name: "description",
        content:
          "Refund and cancellation policy for Kenya eTA applications. Understand your rights before you apply.",
      },
      { property: "og:title", content: "Refund Policy" },
      {
        property: "og:description",
        content: "Our refund and cancellation policy for Kenya eTA applications.",
      },
      { property: "og:url", content: absoluteUrl("/refund") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/refund") }],
  }),
  component: Refund,
});

const linkClass = "text-primary underline decoration-dotted hover:text-foreground";

function Refund() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Refund Policy" description="Last updated 8 September 2026" />
      <Section className="max-w-3xl">
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <p>
            At <strong className="text-foreground">Kenyaevisa.net</strong>, we aim to provide
            high-quality application assistance. This Refund Policy explains the conditions under
            which refunds are issued for our services.
          </p>

          <Block n="1" title="Service Fee">
            We charge a single, all-inclusive fee per applicant, covering our guided application
            form, manual review of your details and documents, submission on the official eTA
            portal on your behalf, and support until a decision is issued:
            <ul className="list-disc space-y-1 pl-6 mt-2">
              <li>
                <strong className="text-foreground">Standard — {money(TOTAL_FEE)} USD</strong>{" "}
                (Tourism or Friends and Family)
              </li>
              <li>
                <strong className="text-foreground">Transit — {money(TRANSIT_FEE)} USD</strong>
              </li>
              <li>
                <strong className="text-foreground">Express — {money(EXPRESS_FEE)} USD</strong>{" "}
                (priority handling)
              </li>
            </ul>
          </Block>

          <Block n="2" title="Refund Eligibility">
            Your fee is eligible for a refund only if we are unable to submit your application due
            to a technical issue on our side. <strong className="text-foreground">No other
            refunds will be issued.</strong>
          </Block>

          <Block n="3" title="Non-Refundable Items">
            <ul className="list-disc space-y-1 pl-6">
              <li>Applications that have already been submitted to the official eTA portal are non-refundable.</li>
              <li>Rejections, delays, or denials by Kenyan authorities do not qualify for a refund.</li>
              <li>Any cancellation requested by you after payment is not eligible for a refund.</li>
              <li>Payment provider transaction fees are non-refundable and will be deducted from any refund amount.</li>
            </ul>
          </Block>

          <Block n="4" title="How to Request a Refund">
            Email{" "}
            <a href={`mailto:${CONTACT.email}?subject=Refund%20request`} className={linkClass}>
              {CONTACT.email}
            </a>{" "}
            with the subject line "Refund request," your full name, application reference number,
            and the reason. We respond within 48 hours; approved refunds are processed within 3–5
            business days, less any non-refundable payment provider fees.
          </Block>

          <Block n="5" title="No Guarantee of Approval">
            We do not guarantee approval of your eTA application. All final decisions are made
            solely by the Government of Kenya.
          </Block>

          <Block n="6" title="Changes to Refund Policy">
            We may update this Refund Policy from time to time. The latest version will be posted
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
            <Link to="/privacy" className={linkClass}>
              Privacy Policy
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

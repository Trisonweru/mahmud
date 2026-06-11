import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/SectionHeading";
import { PageSEO } from "@/components/PageSEO";

const Refund = () => (
  <>
  <PageSEO
    title="Refund Policy — Somalia eVisa Application Service"
    description="Refund and cancellation policy for Somalia eVisa applications. Understand your rights before you apply."
    canonical="https://www.evisasomali.com/refund"
  />
  <section className="container py-20 max-w-3xl">
    <SectionHeading eyebrow="Legal" title="Refund Policy" />
    <p className="mt-6 text-sm text-muted-foreground">Last Updated: 10 March 2026</p>

    <p className="mt-8 text-sm leading-relaxed text-foreground/85">
      At <strong>eVisaSomali</strong>, we strive to provide high-quality visa
      application assistance. This Refund Policy explains the conditions under which refunds are
      issued for our services on evisasomali.com.
    </p>

    <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/85">
      <Block n="1" title="Service Fee">
        Our total fee is <strong>$94 USD</strong> (all-inclusive) per application. This includes:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>The official government eTAS fee of $64 USD (forwarded 100% to the official government portal)</li>
          <li>Our private service fee of $30 USD for form review, error-checking, document preparation, and submission assistance.</li>
        </ul>
      </Block>

      <Block n="2" title="Refund Eligibility">
        You are eligible for a refund of our private service fee ($94 USD) only if we are unable to
        submit your application due to a technical issue on our side. <strong>No other refunds will
        be issued.</strong>
      </Block>

      <Block n="3" title="Non-Refundable Items">
        <ul className="list-disc pl-6 space-y-1">
          <li>The government fee of $64 USD is non-refundable once it has been paid and submitted to the official government portal.</li>
          <li>Applications that have already been submitted to the government portal are non-refundable.</li>
          <li>Rejections, delays, or denials by the destination government do not qualify for a refund.</li>
          <li>Any cancellation requested by you after payment is not eligible for a refund.</li>
          <li>Payment gateway transaction fees are non-refundable and will be deducted from any refund amount.</li>
        </ul>
      </Block>

      <Block n="4" title="How to Request a Refund">
        Email{" "}
        <a href="mailto:refunds@evisasomali.com" className="text-accent underline">
          refunds@evisasomali.com
        </a>{" "}
        with your full name, application reference number, and the reason. We respond within 48
        hours; approved refunds are processed within 3–5 business days, less non-refundable gateway
        fees.
      </Block>

      <Block n="5" title="No Guarantee of Approval">
        We do not guarantee approval of your eTAS application. All final decisions are made solely
        by the the destination government.
      </Block>

      <Block n="6" title="Changes to Refund Policy">
        We may update this Refund Policy from time to time. The latest version will be posted on our
        website with the updated date.
      </Block>

      <div className="border-t border-border pt-8 text-center text-muted-foreground">
        <h2 className="font-serif text-2xl text-primary">Contact Us</h2>
        <p className="mt-3">
          Email:{" "}
          <a href="mailto:refunds@evisasomali.com" className="text-accent underline">
            refunds@evisasomali.com
          </a>
          <br />
          Phone / WhatsApp: +252 61 3886027
          <br />
          Registered Office: 71–75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom
          <br />
          Company Name: eVisaSomali
          <br />
          Company No.: 16877709
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        See also: <Link to="/terms" className="text-accent underline">Terms of Service</Link> ·{" "}
        <Link to="/privacy" className="text-accent underline">Privacy Policy</Link>
      </p>
    </div>
  </section>
  </>
);

const Block = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="font-serif text-2xl text-primary">{n}. {title}</h2>
    <div className="mt-3">{children}</div>
  </div>
);

export default Refund;

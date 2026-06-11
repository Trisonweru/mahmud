import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/SectionHeading";
import { PageSEO } from "@/components/PageSEO";

const Terms = () => (
  <>
  <PageSEO
    title="Terms & Conditions — Somalia eVisa Application Service"
    description="Read the terms and conditions governing use of the eVisa Somalia specialist application service."
    canonical="https://www.evisasomali.com/terms"
  />
  <section className="container py-20 max-w-3xl">
    <SectionHeading eyebrow="Legal" title="Terms of Service" />
    <p className="mt-6 text-sm text-muted-foreground">Last Updated: 10 March 2026</p>

    <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/85">
      <Block n="1" title="Service Provider">
        This service is provided by <strong>PassKey Technologies Ltd</strong> ("we," "us," or "our"),
        a private third-party company registered in England &amp; Wales (Company No. 16877709),
        registered office: 71–75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom.
        We are not affiliated with, endorsed by,
        or part of the the destination government or the official eTAS portal (the official government portal).
        We offer paid assistance to help you prepare and submit your eVisa application
        through the only official portal: the official government portal.
      </Block>

      <Block n="2" title="Service Fee">
        Our total fee is <strong>$94 USD</strong> (all-inclusive), which covers:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>The official government eTAS fee ($64 USD, forwarded 100% to the official government portal)</li>
          <li>Our application assistance, document review, and submission service fee</li>
        </ul>
      </Block>

      <Block n="3" title="Refund Policy">
        Refunds are governed by our separate{" "}
        <Link to="/refund" className="text-accent underline">Refund Policy</Link>.
        No refunds are available except as expressly stated in that policy.
      </Block>

      <Block n="4" title="No Guarantee of Approval">
        We do <strong>not</strong> guarantee visa approval or entry into your destination. All decisions are
        made solely by the the destination government through the official eTAS system.
      </Block>

      <Block n="5" title="Your Responsibilities">
        You agree to:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Provide accurate, complete, and truthful information.</li>
          <li>Upload valid and legible supporting documents.</li>
          <li>Review your application before submission.</li>
        </ul>
        We are not liable for application rejections, delays, or entry denials resulting from errors,
        omissions, or false information provided by you.
      </Block>

      <Block n="6" title="Cancellation Rights">
        By proceeding with payment, you request immediate performance of our service. Once your
        application is submitted to the official government portal, you waive your right to cancel the service.
        You will be required to check a box stating "I request immediate performance of services"
        before completing payment. Once your application is submitted to the official government portal, you waive any
        right of withdrawal under the UK Consumer Rights Act 2015.
      </Block>

      <Block n="7" title="Data Protection">
        Your personal data is handled in accordance with our{" "}
        <Link to="/privacy" className="text-accent underline">Privacy Policy</Link> and the
        applicable data protection laws of the United Kingdom.
      </Block>

      <Block n="8" title="Limitation of Liability">
        Our total liability for any claim arising from the use of our services is limited to the
        amount you paid us ($94 USD). We are not liable for:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Visa refusals or entry denials by destination authorities</li>
          <li>Travel disruptions, financial losses, or consequential damages</li>
          <li>Changes in government policy or processing delays</li>
        </ul>
      </Block>

      <Block n="9" title="Governing Law">
        These Terms are governed by and construed in accordance with the laws of England and
        Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of
        England and Wales.
      </Block>

      <Block n="10" title="Changes to These Terms">
        We may update these Terms from time to time. The latest version will be posted here with an
        updated "Last Updated" date. Continued use of our Services constitutes acceptance.
      </Block>

      <div className="border-t border-border pt-8 text-center text-muted-foreground">
        <h2 className="font-serif text-2xl text-primary">Contact Us</h2>
        <p className="mt-3">
          Email:{" "}
          <a href="mailto:support@evisasomali.com" className="text-accent underline">
            support@evisasomali.com
          </a>
          <br />
          Registered Office: 71–75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom
          <br />
          Company No.: 16877709
        </p>
      </div>
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

export default Terms;

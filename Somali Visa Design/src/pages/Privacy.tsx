import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/SectionHeading";
import { PageSEO } from "@/components/PageSEO";

const Privacy = () => (
  <>
  <PageSEO
    title="Privacy Policy — Somalia eVisa Application Service"
    description="How eVisa Somalia collects, uses and protects your personal data when you apply for a Somalia eVisa. Bank-grade encryption. Never shared with third parties."
    canonical="https://www.evisasomali.com/privacy"
  />
  <section className="container py-20 max-w-3xl">
    <SectionHeading eyebrow="Legal" title="Privacy Policy" />
    <p className="mt-6 text-sm text-muted-foreground">Last Updated: 10 March 2026</p>

    <p className="mt-8 text-sm leading-relaxed text-foreground/85">
      This Privacy Policy explains how <strong>eVisa Somalia</strong> ("we," "us," or
      "our") collects, uses, and protects your personal information when you use our website and
      related visa assistance services ("Services"). By using our Website, you agree to the
      practices described in this Privacy Policy.
    </p>

    <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/85">
      <Block n="1" title="Data Controller">
        <strong>eVisa Somalia</strong> — a private company registered in England &amp;
        Wales (Company No. 16877709), registered office: 71–75 Shelton Street, Covent Garden,
        London WC2H 9JQ, United Kingdom. We are an
        independent third-party service provider and are not affiliated with, endorsed by, or
        connected to the the Somali government or any of its departments.
      </Block>

      <Block n="2" title="Information We Collect">
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Personal Identifiers:</strong> Full Name, Date of Birth, Nationality</li>
          <li><strong>Passport Details:</strong> Passport Number, Country, Issue & Expiry Date</li>
          <li><strong>Special Category / Biometric Data:</strong> Passport Photo / Scan</li>
          <li><strong>Contact Information:</strong> Email Address, Phone Number</li>
          <li><strong>Technical Data:</strong> IP address, browser type (collected automatically)</li>
        </ul>
      </Block>

      <Block n="3" title="How We Use Your Data (Lawful Basis)">
        We process your data under the UK General Data Protection Regulation (UK GDPR):
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li><strong>Contract Performance:</strong> To prepare and submit your eTAS application to the official Somali eTAS portal.</li>
          <li><strong>Explicit Consent:</strong> For processing your passport photo (special category / biometric data).</li>
          <li><strong>Legitimate Interests:</strong> For customer support, fraud prevention, and service improvement.</li>
        </ul>
      </Block>

      <Block n="4" title="International Data Transfers">
        Your application data (including passport details and photo) will be transferred to the
        the Somali government (the official Somali eTAS portal) for processing your eTAS application.
      </Block>

      <Block n="5" title="Who We Share Your Data With">
        <ul className="list-disc pl-6 space-y-1">
          <li>The the Somali government (the official Somali eTAS portal) — to process your official eTAS application</li>
          <li>Our payment gateway provider — to process your $94 payment</li>
          <li>Trusted service providers who assist us (under strict confidentiality agreements)</li>
        </ul>
        We do not sell, trade, or rent your personal data to third parties.
      </Block>

      <Block n="6" title="Data Retention">
        <ul className="list-disc pl-6 space-y-1">
          <li>Passport images and application documents: deleted within 7 days after submission to the official Somali eTAS portal</li>
          <li>Transaction records: retained for up to 7 years as required by UK law</li>
        </ul>
      </Block>

      <Block n="7" title="Your Rights under UK GDPR">
        You have the right to access, correct, request deletion of, object to or restrict
        processing, and withdraw consent for your data. Contact us at{" "}
        <a href="mailto:support@evisasomali.com" className="text-accent underline">
          support@evisasomali.com
        </a>. You may also lodge a complaint with the Information Commissioner's Office (ICO).
      </Block>

      <Block n="8" title="Cookies & Tracking">
        We use essential cookies to ensure the website functions properly. We do not use
        non-essential tracking cookies without your consent.
      </Block>

      <Block n="9" title="Updates to This Policy">
        We may update this Privacy Policy from time to time. The latest version will be posted on
        this page with an updated "Last Updated" date.
      </Block>

      <div className="border-t border-border pt-8 text-center text-muted-foreground">
        <h2 className="font-serif text-2xl text-primary">Contact Us</h2>
        <p className="mt-3">
          Email:{" "}
          <a href="mailto:support@evisasomali.com" className="text-accent underline">
            support@evisasomali.com
          </a>
          <br />
          Phone / WhatsApp: +252 61 3886027
          <br />
          Registered Office: 71–75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom
          <br />
          Company No.: 16877709
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        See also: <Link to="/terms" className="text-accent underline">Terms of Service</Link> ·{" "}
        <Link to="/refund" className="text-accent underline">Refund Policy</Link>
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

export default Privacy;

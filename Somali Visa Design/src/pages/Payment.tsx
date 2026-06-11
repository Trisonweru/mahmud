import { useLocation, Link } from "react-router-dom";
import { SectionHeading } from "@/components/SectionHeading";
import { Lock, ShieldCheck, Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getPending, clearPending } from "@/lib/pendingApplication";
import { FUNCTIONS_URL, fnHeaders } from "@/lib/api";
import {
  PayPalScriptProvider,
  PayPalCardFieldsProvider,
  PayPalNumberField,
  PayPalExpiryField,
  PayPalCVVField,
  usePayPalCardFields,
} from "@paypal/react-paypal-js";
import type { CardFieldsOnApproveData } from "@paypal/paypal-js";

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID as string;

const FIELD_STYLE: Record<string, Record<string, string>> = {
  input: {
    "font-size": "14px",
    color: "#0a0f1e",
    "font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "0 12px",
  },
  "input::placeholder": { color: "#94a3b8" },
  ".invalid": { color: "#ef4444" },
};

function CardSubmitButton({
  agreed,
  submitting,
  onSubmitting,
  onError,
}: {
  agreed: boolean;
  submitting: boolean;
  onSubmitting: (v: boolean) => void;
  onError: (msg: string) => void;
}) {
  const { cardFieldsForm } = usePayPalCardFields();

  const handleClick = async () => {
    if (!cardFieldsForm || submitting || !agreed) return;
    onSubmitting(true);
    try {
      await cardFieldsForm.submit();
    } catch (err) {
      onSubmitting(false);
      const msg =
        err instanceof Error
          ? err.message
          : "Card payment failed. Please check your details and try again.";
      onError(msg);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!agreed || submitting}
      className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-gold px-8 py-4 text-sm font-medium text-accent-foreground shadow-gold hover:shadow-elegant transition-smooth disabled:opacity-40 disabled:cursor-not-allowed mt-4"
    >
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Processing payment…
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" /> Pay $94.00 USD
        </>
      )}
    </button>
  );
}

const Payment = () => {
  const location = useLocation() as {
    state?: { type?: string; email?: string; fullName?: string };
  };
  const isExpress = location.state?.type === "express";
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [paypalSuccess, setPaypalSuccess] = useState<string | null>(null);

  const handlePaypalCreate = async (): Promise<string> => {
    const data = getPending();
    if (!data)
      throw new Error("Application data lost. Please restart the application.");

    const fd = new FormData();
    for (const [k, v] of Object.entries(data)) {
      if (v == null || v instanceof File) continue;
      fd.append(k, String(v));
    }

    const res = await fetch(`${FUNCTIONS_URL}/paypal-create-order`, {
      method: "POST",
      headers: fnHeaders(),
      body: fd,
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.ok || !json.order_id) {
      throw new Error(json.error || "Failed to create order. Please try again.");
    }

    return json.order_id as string;
  };

  const handlePaypalApprove = async (data: CardFieldsOnApproveData) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${FUNCTIONS_URL}/paypal-capture-order`, {
        method: "POST",
        headers: { ...fnHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: data.orderID }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Payment capture failed. Please contact support.");
      }

      clearPending();
      setPaypalSuccess(json.reference as string);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (paypalSuccess) {
    return (
      <section className="container py-28 max-w-2xl text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-accent-soft">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>
        <h1 className="mt-8 font-serif text-4xl text-primary">Payment Successful</h1>
        <p className="mt-4 text-muted-foreground max-w-md mx-auto">
          Your application reference is{" "}
          <span className="font-mono font-semibold text-primary">{paypalSuccess}</span>. A
          confirmation email has been sent. Our team will begin processing your eVisa right away.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={`/status?ref=${encodeURIComponent(paypalSuccess)}`}
            className="inline-flex items-center justify-center rounded-sm bg-gradient-navy px-8 py-4 text-sm font-medium text-primary-foreground shadow-card hover:shadow-elegant transition-smooth"
          >
            Track your application
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm border border-border px-8 py-4 text-sm font-medium text-foreground hover:border-accent transition-smooth"
          >
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-20 max-w-5xl">
      <SectionHeading eyebrow="Secure Payment" title="Complete your application" />

      <div className="mt-12 grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Card form */}
        <div className="bg-card border border-border rounded-sm p-8 md:p-10 shadow-card space-y-6">
          <div className="flex items-center gap-2 text-sm text-accent">
            <Lock className="h-4 w-4" /> Secure card payment — powered by PayPal
          </div>

          {/* Payment summary */}
          <div className="rounded-sm border border-border bg-secondary/40 px-4 py-4 space-y-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Payment Summary
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground">eVisa application fee</span>
              <span className="font-medium">$94.00 USD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground">Processing</span>
              <span className="text-muted-foreground">Included</span>
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 text-sm cursor-pointer border-t border-border pt-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 accent-[hsl(var(--accent))]"
            />
            <span className="text-foreground/85">
              I confirm that I have read and agree to the{" "}
              <Link to="/terms" className="text-accent underline">Terms of Service</Link>,{" "}
              <Link to="/privacy" className="text-accent underline">Privacy Policy</Link>, and{" "}
              <Link to="/refund" className="text-accent underline">Refund Policy</Link>. *
            </span>
          </label>

          {submitError && (
            <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          {/* PayPal Card Fields */}
          <PayPalScriptProvider
            options={{
              clientId: PAYPAL_CLIENT_ID,
              currency: "USD",
              intent: "capture",
              components: "card-fields",
            }}
          >
            <PayPalCardFieldsProvider
              createOrder={handlePaypalCreate}
              onApprove={handlePaypalApprove}
              onError={(err) => {
                console.error("PayPal error", err);
                const msg = "Card payment error. Please check your details and try again.";
                setSubmitError(msg);
                toast.error(msg);
                setSubmitting(false);
              }}
            >
              <div className={`space-y-3 ${!agreed ? "opacity-40 pointer-events-none select-none" : ""}`}>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
                    Card Number
                  </label>
                  <div className="h-11 border border-border rounded-sm bg-background overflow-hidden">
                    <PayPalNumberField style={FIELD_STYLE} placeholder="0000 0000 0000 0000" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
                      Expiry Date
                    </label>
                    <div className="h-11 border border-border rounded-sm bg-background overflow-hidden">
                      <PayPalExpiryField style={FIELD_STYLE} placeholder="MM / YY" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
                      Security Code
                    </label>
                    <div className="h-11 border border-border rounded-sm bg-background overflow-hidden">
                      <PayPalCVVField style={FIELD_STYLE} placeholder="CVV" />
                    </div>
                  </div>
                </div>

                <CardSubmitButton
                  agreed={agreed}
                  submitting={submitting}
                  onSubmitting={setSubmitting}
                  onError={(msg) => {
                    setSubmitError(msg);
                    toast.error(msg);
                  }}
                />
              </div>
            </PayPalCardFieldsProvider>

            {!agreed && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Please agree to the terms above to enable payment
              </p>
            )}
          </PayPalScriptProvider>

          <p className="text-center text-[11px] text-muted-foreground">
            Your card details are secured by PayPal. You never leave this page.
          </p>
        </div>

        {/* Order summary sidebar */}
        <aside className="bg-primary text-primary-foreground rounded-sm p-8 shadow-elegant h-fit">
          <div className="text-xs uppercase tracking-[0.25em] text-accent">Order Summary</div>
          <div className="mt-6 font-serif text-2xl">
            {isExpress ? "Express eVisa Application" : "eVisa Application"}
          </div>
          <p className="mt-2 text-sm text-primary-foreground/70">
            Single entry · Valid up to 180 days
          </p>
          <div className="mt-8 space-y-3 text-sm border-t border-primary-foreground/10 pt-6">
            <Row label="Applicable fee" value="$94.00" />
            <Row label="Processing" value="Included" />
          </div>
          <div className="mt-6 pt-6 border-t border-primary-foreground/10 flex items-end justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">Total</span>
            <span className="font-serif text-3xl text-accent">$94</span>
          </div>
          <div className="mt-8 flex items-start gap-2 text-xs text-primary-foreground/60">
            <ShieldCheck className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            256-bit SSL encryption · PCI-DSS compliant · Secured by PayPal
          </div>
          <div className="mt-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
            </svg>
            <span className="text-[11px] text-primary-foreground/50">Powered by PayPal Advanced Checkout</span>
          </div>
        </aside>
      </div>
    </section>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-primary-foreground/80">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default Payment;

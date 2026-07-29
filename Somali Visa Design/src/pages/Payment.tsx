import { useLocation, Link } from "react-router-dom";
import { SectionHeading } from "@/components/SectionHeading";
import { Lock, ShieldCheck, Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getPending, clearPending } from "@/lib/pendingApplication";
import { FUNCTIONS_URL, fnHeaders } from "@/lib/api";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

function CheckoutForm({
  agreed,
  reference,
  fee,
  onSuccess,
}: {
  agreed: boolean;
  reference: string;
  fee: number;
  onSuccess: (ref: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [nameError, setNameError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || submitting || !agreed) return;

    if (!cardholderName.trim()) {
      setNameError("Name on card is required.");
      return;
    }
    setNameError("");
    setSubmitting(true);
    setSubmitError("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/return`,
          payment_method_data: {
            billing_details: { name: cardholderName.trim() },
          },
        },
        redirect: "if_required",
      });

      if (error) {
        const msg = error.message ?? "Payment failed. Please check your details and try again.";
        setSubmitError(msg);
        toast.error(msg);
        setSubmitting(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        clearPending();
        onSuccess(reference);
        return;
      }

      setSubmitting(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment processing failed. Please try again.";
      setSubmitError(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="cardholder-name" className="block text-xs font-medium text-foreground/80">
          Name on card <span className="text-destructive">*</span>
        </label>
        <input
          id="cardholder-name"
          type="text"
          autoComplete="cc-name"
          placeholder="Full name as it appears on card"
          value={cardholderName}
          onChange={(e) => { setCardholderName(e.target.value); if (nameError) setNameError(""); }}
          className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {nameError && <p className="text-xs text-destructive">{nameError}</p>}
      </div>

      <div className={!agreed ? "opacity-40 pointer-events-none select-none" : ""}>
        <PaymentElement
          options={{
            layout: "tabs",
            wallets: { link: "never" },
            fields: {
              billingDetails: {
                name: "never",
              },
            },
          }}
        />
      </div>

      {!agreed && (
        <p className="text-center text-xs text-muted-foreground">
          Please agree to the terms above to enable payment
        </p>
      )}

      {submitError && (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={!agreed || submitting || !stripe || !elements}
        className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-gold px-8 py-4 text-sm font-medium text-accent-foreground shadow-gold hover:shadow-elegant transition-smooth disabled:opacity-40 disabled:cursor-not-allowed mt-2"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Processing payment…
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" /> Pay ${fee.toFixed(2)} USD
          </>
        )}
      </button>
    </form>
  );
}

const Payment = () => {
  const location = useLocation() as {
    state?: { type?: string; email?: string; fullName?: string };
  };
  const isExpress = location.state?.type === "express";
  const isRushSpeed = getPending()?.processingSpeed === "express";
  const [agreed, setAgreed] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [fee, setFee] = useState<number | null>(null);
  const [loadError, setLoadError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const pending = getPending();
    if (!pending?.application_id) {
      setLoadError("Application data lost. Please restart the application.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${FUNCTIONS_URL}/stripe-create-intent`, {
          method: "POST",
          headers: { ...fnHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ application_id: pending.application_id }),
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.ok) {
          throw new Error(json.error ?? "Failed to initialize payment. Please try again.");
        }

        if (json.already_paid) {
          clearPending();
          setSuccess((pending.reference as string | undefined) ?? "");
          return;
        }

        setClientSecret(json.client_secret as string);
        setReference((pending.reference as string | undefined) ?? "");
        setFee(typeof json.fee === "number" ? json.fee : null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Payment initialization failed.";
        setLoadError(msg);
        toast.error(msg);
      }
    })();
  }, []);

  if (success !== null) {
    return <SuccessScreen reference={success} />;
  }

  return (
    <section className="container py-20 max-w-5xl">
      <SectionHeading eyebrow="Secure Payment" title="Complete your application" />

      <div className="mt-12 grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Card form */}
        <div className="bg-card border border-border rounded-sm p-8 md:p-10 shadow-card space-y-6">
          <div className="flex items-center gap-2 text-sm text-accent">
            <Lock className="h-4 w-4" /> Secure card payment — powered by Stripe
          </div>

          {/* Payment summary */}
          <div className="rounded-sm border border-border bg-secondary/40 px-4 py-4 space-y-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Payment Summary
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground">eVisa application fee</span>
              <span className="font-medium">{fee != null ? `$${fee.toFixed(2)} USD` : "…"}</span>
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

          {loadError && (
            <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {loadError}
            </div>
          )}

          {!loadError && !clientSecret && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Preparing payment form…
            </div>
          )}

          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "hsl(43 74% 49%)",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    borderRadius: "2px",
                  },
                },
              }}
            >
              <CheckoutForm
                agreed={agreed}
                reference={reference}
                fee={fee ?? 0}
                onSuccess={(ref) => setSuccess(ref)}
              />
            </Elements>
          )}

          <p className="text-center text-[11px] text-muted-foreground">
            Your card details are secured by Stripe. You may be redirected to your bank to verify the payment — please complete any security steps your bank requires.
          </p>
        </div>

        {/* Order summary sidebar */}
        <aside className="bg-primary text-primary-foreground rounded-sm p-8 shadow-elegant h-fit">
          <div className="text-xs uppercase tracking-[0.25em] text-accent">Order Summary</div>
          <div className="mt-6 font-serif text-2xl">
            {isRushSpeed ? "Express eVisa Application" : isExpress ? "Standard eVisa Application" : "eVisa Application"}
          </div>
          <p className="mt-2 text-sm text-primary-foreground/70">
            Single entry · Valid up to 180 days
          </p>
          <div className="mt-8 space-y-3 text-sm border-t border-primary-foreground/10 pt-6">
            <Row label="Applicable fee" value={fee != null ? `$${fee.toFixed(2)}` : "…"} />
            <Row label="Processing" value="Included" />
          </div>
          <div className="mt-6 pt-6 border-t border-primary-foreground/10 flex items-end justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">Total</span>
            <span className="font-serif text-3xl text-accent">{fee != null ? `$${fee}` : "…"}</span>
          </div>
          <div className="mt-8 flex items-start gap-2 text-xs text-primary-foreground/60">
            <ShieldCheck className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            256-bit SSL encryption · PCI-DSS compliant · Secured by Stripe
          </div>
        </aside>
      </div>
    </section>
  );
};

function SuccessScreen({ reference }: { reference: string }) {
  return (
    <section className="container py-28 max-w-2xl text-center">
      <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-accent-soft">
        <CheckCircle2 className="h-8 w-8 text-accent" />
      </div>
      <h1 className="mt-8 font-serif text-4xl text-primary">Payment Successful</h1>
      <p className="mt-4 text-muted-foreground max-w-md mx-auto">
        {reference ? (
          <>
            Your application reference is{" "}
            <span className="font-mono font-semibold text-primary">{reference}</span>.{" "}
          </>
        ) : null}
        A confirmation email has been sent. Our team will begin processing your eVisa right away.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        {reference && (
          <Link
            to={`/status?ref=${encodeURIComponent(reference)}`}
            className="inline-flex items-center justify-center rounded-sm bg-gradient-navy px-8 py-4 text-sm font-medium text-primary-foreground shadow-card hover:shadow-elegant transition-smooth"
          >
            Track your application
          </Link>
        )}
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

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-primary-foreground/80">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default Payment;

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { FUNCTIONS_URL, fnHeaders } from "@/lib/api";
import { clearPending, getPending } from "@/lib/pendingApplication";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Payment — Kenya eTA Application" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Payment,
});

const stripePromise = loadStripe(import.meta.env["VITE_STRIPE_PUBLISHABLE_KEY"] as string);

function CheckoutForm({ fee, onSuccess }: { fee: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cardholderName, setCardholderName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;
    if (!cardholderName.trim()) {
      setError("Name on card is required.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/return`,
          payment_method_data: { billing_details: { name: cardholderName.trim() } },
        },
        redirect: "if_required",
      });

      if (stripeError) {
        const msg =
          stripeError.message ?? "Payment failed. Please check your details and try again.";
        setError(msg);
        toast.error(msg);
        setSubmitting(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        clearPending();
        onSuccess();
        return;
      }
      setSubmitting(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Payment processing failed. Please try again.";
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cardholder-name">Name on card</Label>
        <Input
          id="cardholder-name"
          autoComplete="cc-name"
          placeholder="Full name as it appears on card"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
        />
      </div>

      <PaymentElement options={{ layout: "tabs", wallets: { link: "never" } }} />

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={submitting || !stripe || !elements}
      >
        {submitting ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <CreditCard className="mr-2 size-4" />
        )}
        Pay ${fee.toFixed(2)}
      </Button>
    </form>
  );
}

function Payment() {
  const pending = getPending();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fee, setFee] = useState<number | null>(null);
  const [loadError, setLoadError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!pending?.application_id) {
      setLoadError("Application data lost. Please start a new application.");
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
          setSuccess(true);
          return;
        }
        setClientSecret(json.client_secret);
        setFee(typeof json.fee === "number" ? json.fee : null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Payment initialization failed.";
        setLoadError(msg);
        toast.error(msg);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (success) {
    return (
      <Section className="max-w-xl text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-bold">Payment successful</h1>
        <p className="mt-3 text-muted-foreground">
          {pending?.reference ? (
            <>
              Your application reference is{" "}
              <span className="font-mono font-semibold text-foreground">{pending.reference}</span>
              .{" "}
            </>
          ) : null}
          A confirmation email has been sent. Our team will begin processing your Kenya eTA right
          away.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {pending?.reference ? (
            <Button asChild size="lg">
              <Link to="/track">Track your application</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" size="lg">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Secure payment" title="Complete your application" />
      <Section className="max-w-3xl">
        <Card>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Lock className="size-4" /> Secure card payment — powered by Stripe
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-secondary/40 px-4 py-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Payment summary
              </div>
              <div className="flex justify-between text-sm">
                <span>Kenya eTA application fee</span>
                <span className="font-medium">{fee != null ? `$${fee.toFixed(2)}` : "…"}</span>
              </div>
            </div>

            {loadError ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
              >
                {loadError}
              </div>
            ) : null}

            {!loadError && !clientSecret ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Preparing payment form…
              </div>
            ) : null}

            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm fee={fee ?? 0} onSuccess={() => setSuccess(true)} />
              </Elements>
            ) : null}

            <p className="flex items-center gap-2 text-center text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0" />
              256-bit SSL encryption · PCI-DSS compliant · Secured by Stripe
            </p>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}

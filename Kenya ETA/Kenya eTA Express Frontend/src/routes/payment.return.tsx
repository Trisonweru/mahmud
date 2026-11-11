import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/PageHeader";
import { clearPending, getPending } from "@/lib/pendingApplication";

export const Route = createFileRoute("/payment/return")({
  head: () => ({
    meta: [
      { title: "Confirming payment — Kenya eTA Application" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaymentReturn,
});

const stripePromise = loadStripe(import.meta.env["VITE_STRIPE_PUBLISHABLE_KEY"] as string);

type State = "verifying" | "success" | "failed";

function PaymentReturn() {
  const [state, setState] = useState<State>("verifying");
  const [reference, setReference] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret",
    );
    if (!clientSecret) {
      setErrorMsg(
        "No payment confirmation received. If you completed payment, please contact support.",
      );
      setState("failed");
      return;
    }

    (async () => {
      try {
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Payment provider unavailable.");

        const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);
        if (error) throw new Error(error.message ?? "Could not verify payment.");

        if (paymentIntent?.status === "succeeded") {
          const pending = getPending();
          setReference(pending?.reference ?? "");
          clearPending();
          setState("success");
        } else {
          setErrorMsg(
            paymentIntent?.status === "requires_payment_method"
              ? "Your payment was not completed. Please try again with a different card."
              : "Payment could not be confirmed. Please contact support.",
          );
          setState("failed");
        }
      } catch (err) {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Network error while verifying payment. Please contact support with your transaction details.",
        );
        setState("failed");
      }
    })();
  }, []);

  if (state === "verifying") {
    return (
      <Section className="max-w-xl text-center">
        <Loader2 className="mx-auto size-12 animate-spin text-primary" />
        <h1 className="mt-6 text-2xl font-bold">Confirming your payment…</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Please wait while we verify your payment.
        </p>
      </Section>
    );
  }

  if (state === "success") {
    return (
      <Section className="max-w-xl text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-bold">Payment successful</h1>
        <p className="mt-3 text-muted-foreground">
          {reference ? (
            <>
              Your application reference is{" "}
              <span className="font-mono font-semibold text-foreground">{reference}</span>.{" "}
            </>
          ) : null}
          A confirmation email has been sent. Our team will begin processing your Kenya eTA right
          away.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {reference ? (
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
    <Section className="max-w-xl text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <XCircle className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-bold">Payment not confirmed</h1>
      <p className="mt-3 text-muted-foreground">{errorMsg}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link to="/payment">Try again</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/track">Check application status</Link>
        </Button>
      </div>
    </Section>
  );
}

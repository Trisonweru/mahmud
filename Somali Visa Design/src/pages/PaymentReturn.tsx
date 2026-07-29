import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { clearPending, getPending } from "@/lib/pendingApplication";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

type State = "verifying" | "success" | "failed";

const PaymentReturn = () => {
  const [params] = useSearchParams();
  const clientSecret = params.get("payment_intent_client_secret");
  const [state, setState] = useState<State>("verifying");
  const [reference, setReference] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!clientSecret) {
      setErrorMsg("No payment confirmation received. If you completed payment, please contact support.");
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
          const ref = (pending?.reference as string | undefined) ?? "";
          clearPending();
          setReference(ref);
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
  }, [clientSecret]);

  if (state === "verifying") {
    return (
      <section className="container py-28 max-w-2xl text-center">
        <Loader2 className="h-12 w-12 text-accent mx-auto animate-spin" />
        <h1 className="mt-8 font-serif text-3xl text-primary">Confirming your payment…</h1>
        <p className="mt-3 text-sm text-muted-foreground">Please wait while we verify your payment.</p>
      </section>
    );
  }

  if (state === "success") {
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

  return (
    <section className="container py-28 max-w-2xl text-center">
      <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="mt-8 font-serif text-4xl text-primary">Payment Not Confirmed</h1>
      <p className="mt-4 text-muted-foreground max-w-md mx-auto">{errorMsg}</p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/payment"
          className="inline-flex items-center justify-center rounded-sm bg-gradient-navy px-8 py-4 text-sm font-medium text-primary-foreground shadow-card hover:shadow-elegant transition-smooth"
        >
          Try again
        </Link>
        <Link
          to="/status"
          className="inline-flex items-center justify-center rounded-sm border border-border px-8 py-4 text-sm font-medium text-foreground hover:border-accent transition-smooth"
        >
          Check application status
        </Link>
      </div>
    </section>
  );
};

export default PaymentReturn;

import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { FUNCTIONS_URL, fnHeaders } from "@/lib/api";
import { clearPending } from "@/lib/pendingApplication";

type State = "verifying" | "success" | "failed";

const PaymentReturn = () => {
  const [params] = useSearchParams();
  const transToken = params.get("TransactionToken");
  const [state, setState] = useState<State>("verifying");
  const [reference, setReference] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!transToken) {
      setErrorMsg("No payment token received. If you completed payment, please contact support.");
      setState("failed");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${FUNCTIONS_URL}/payment-verify?TransactionToken=${encodeURIComponent(transToken)}`, { headers: fnHeaders() });
        const json = await res.json().catch(() => ({}));

        if (res.ok && json.ok) {
          clearPending();
          setReference(json.reference ?? "");
          setState("success");
        } else {
          setErrorMsg(json.error ?? "Payment could not be verified. Please contact support.");
          setState("failed");
        }
      } catch {
        setErrorMsg("Network error while verifying payment. Please contact support with your transaction details.");
        setState("failed");
      }
    })();
  }, [transToken]);

  if (state === "verifying") {
    return (
      <section className="container py-28 max-w-2xl text-center">
        <Loader2 className="h-12 w-12 text-accent mx-auto animate-spin" />
        <h1 className="mt-8 font-serif text-3xl text-primary">Confirming your payment…</h1>
        <p className="mt-3 text-sm text-muted-foreground">Please wait while we verify your payment with DPO.</p>
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
          Your application reference is{" "}
          <span className="font-mono font-semibold text-primary">{reference}</span>. A confirmation
          email has been sent. Our team will begin processing your eVisa right away.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={`/status?ref=${encodeURIComponent(reference)}`}
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

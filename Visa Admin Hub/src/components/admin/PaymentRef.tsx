import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

/**
 * Shows the Stripe PaymentIntent ID tied to a paid application so staff can
 * trace a payment back to its application (and vice versa in the Stripe dashboard).
 */
export function PaymentRef({
  paymentIntentId,
  compact = false,
}: {
  paymentIntentId: string | null | undefined;
  compact?: boolean;
}) {
  if (!paymentIntentId) {
    return <span className="text-[11px] text-muted-foreground">No Stripe ID (manual)</span>;
  }
  const copy = () => {
    navigator.clipboard.writeText(paymentIntentId);
    toast.success("Payment ID copied");
  };
  return (
    <span className="inline-flex max-w-full items-center gap-1.5">
      <span
        className={`truncate font-mono text-foreground ${compact ? "text-[11px]" : "text-xs"}`}
        title={paymentIntentId}
      >
        {paymentIntentId}
      </span>
      <button type="button" onClick={copy} title="Copy payment ID" className="shrink-0 text-muted-foreground hover:text-accent">
        <Copy className="h-3 w-3" />
      </button>
      <a
        href={`https://dashboard.stripe.com/payments/${paymentIntentId}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Open in Stripe"
        className="shrink-0 text-muted-foreground hover:text-accent"
      >
        <ExternalLink className="h-3 w-3" />
      </a>
    </span>
  );
}

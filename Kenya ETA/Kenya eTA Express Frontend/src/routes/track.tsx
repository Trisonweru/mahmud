import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CircleDashed, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { FUNCTIONS_URL, fnHeaders } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Application — Kenya eTA Status" },
      {
        name: "description",
        content:
          "Check the status of your Kenya eTA application using your reference number and email address.",
      },
      { property: "og:title", content: "Track Your Kenya eTA Application" },
      {
        property: "og:description",
        content: "Enter your reference and email to see the current status of your application.",
      },
      { property: "og:url", content: absoluteUrl("/track") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/track") }],
  }),
  component: Track,
});

const STATUS_STEPS = [
  "pending_payment",
  "awaiting_etas",
  "submitted",
  "in_review",
  "approved",
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  awaiting_etas: "Application received",
  submitted: "Submitted for processing",
  in_review: "Under review",
  additional_info: "Additional information needed",
  government_info_required: "Additional information needed by the Kenyan authorities",
  approved: "Approved",
  rejected: "Not approved",
  refunded: "Refunded",
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  pending_payment: "Complete payment to submit your application.",
  awaiting_etas: "Your payment was received and your application is queued for review.",
  submitted: "Your application has been submitted for processing.",
  in_review: "An agent is reviewing your details and documents.",
  additional_info: "We need more information from you — check your email for details.",
  government_info_required:
    "The Kenyan authorities have requested more information — check your email for details.",
  approved: "Your Kenya eTA has been approved and emailed to you.",
  rejected: "Your application was not approved. Check your email for details.",
  refunded: "Your payment has been refunded.",
};

function Track() {
  // Confirmation/refund emails link here as /track?ref=KEN-123456 — prefill it
  // rather than making the applicant re-type the reference they just got emailed.
  const [reference, setReference] = useState(() => {
    if (typeof window === "undefined") return "";
    return (new URLSearchParams(window.location.search).get("ref") ?? "").toUpperCase();
  });
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [resultReference, setResultReference] = useState("");

  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reference.trim().length < 3 || !email.includes("@")) {
      setError(
        "Enter the reference number from your confirmation email and the email you applied with.",
      );
      setStatus(null);
      return;
    }
    setError("");
    setLoading(true);
    setStatus(null);

    try {
      const params = new URLSearchParams({ reference: reference.trim(), email: email.trim() });
      const res = await fetch(`${FUNCTIONS_URL}/status?${params.toString()}`, {
        headers: fnHeaders(),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(
          json.error ?? "No matching application found. Please check your details and try again.",
        );
        return;
      }
      setResultReference(json.reference);
      setStatus(json.status);
    } catch {
      setError("Could not check your status right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const isTerminal = status === "approved" || status === "rejected" || status === "refunded";
  const isSpecialCase = status === "additional_info" || status === "government_info_required";
  const currentStepIndex = status
    ? STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number])
    : -1;

  return (
    <>
      <PageHeader
        eyebrow="Track application"
        title="Check your application status"
        description="Use the reference number from your confirmation email. Statuses update as your application moves through review and processing."
      />
      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <form onSubmit={check} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="reference">Reference number</Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value.toUpperCase())}
                    placeholder="e.g. KEN-123456"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="track-email">Email address</Label>
                  <Input
                    id="track-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                {error ? (
                  <p role="alert" className="text-xs font-medium text-destructive">
                    {error}
                  </p>
                ) : null}
                <Button type="submit" className="w-full bg-cta shadow-soft" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 size-4" />
                  )}
                  Check status
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Status</h2>
              {status ? (
                <>
                  <p className="mt-1 text-sm text-muted-foreground">Reference {resultReference}</p>

                  {isTerminal || isSpecialCase ? (
                    <div className="mt-5 rounded-lg border border-border bg-secondary/40 p-4">
                      <p className="text-sm font-medium">{STATUS_LABELS[status] ?? status}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {STATUS_DESCRIPTIONS[status] ?? ""}
                      </p>
                    </div>
                  ) : (
                    <ol className="mt-5 space-y-4">
                      {STATUS_STEPS.map((step, i) => {
                        const done = currentStepIndex >= 0 && i <= currentStepIndex;
                        return (
                          <li key={step} className="flex gap-3">
                            <span
                              className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                done
                                  ? "bg-accent-soft text-accent-foreground"
                                  : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {done ? "✓" : "•"}
                            </span>
                            <div>
                              <p className="text-sm font-medium">{STATUS_LABELS[step]}</p>
                              {step === status ? (
                                <p className="text-xs text-muted-foreground">
                                  {STATUS_DESCRIPTIONS[step]}
                                </p>
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </>
              ) : (
                <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-secondary/50 p-8 text-center">
                  <CircleDashed className="size-6 text-muted-foreground" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">
                    Enter your reference number and email to see your progress.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
}

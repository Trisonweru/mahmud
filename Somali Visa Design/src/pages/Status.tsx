import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageSEO } from "@/components/PageSEO";
import { SectionHeading } from "@/components/SectionHeading";
import { Search, Loader2, CheckCircle2, AlertTriangle, XCircle, Clock, Landmark } from "lucide-react";
import { API_URL } from "@/lib/api";

type AppStatus = "pending_payment" | "awaiting_etas" | "submitted" | "in_review" | "additional_info" | "government_info_required" | "approved" | "rejected";

// Client-side rate limit: 5 searches per 60 seconds
let searchCount = 0;
let windowStart = Date.now();
function checkRateLimit(): boolean {
  const now = Date.now();
  if (now - windowStart > 60_000) { searchCount = 0; windowStart = now; }
  return ++searchCount <= 5;
}

const STATUS_UI: Record<AppStatus, { label: string; message: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  pending_payment:  { label: "Pending",      message: "Your application is pending review. We will notify you when a decision is made.", icon: Clock,         color: "text-amber-600",  bg: "bg-amber-50 border-amber-200"  },
  awaiting_etas:    { label: "Pending",      message: "Your application is pending review. We will notify you when a decision is made.", icon: Clock,         color: "text-amber-600",  bg: "bg-amber-50 border-amber-200"  },
  submitted:        { label: "Pending",      message: "Your application is pending review. We will notify you when a decision is made.", icon: Clock,         color: "text-blue-600",   bg: "bg-blue-50 border-blue-200"    },
  in_review:        { label: "Pending",      message: "Your application is pending review. We will notify you when a decision is made.", icon: Clock,         color: "text-blue-600",   bg: "bg-blue-50 border-blue-200"    },
  additional_info:          { label: "Info Required",            message: "Additional information is required by our team. Please check your email for instructions.",                                                     icon: AlertTriangle, color: "text-amber-700",   bg: "bg-amber-50 border-amber-300"    },
  government_info_required: { label: "Government Info Required", message: "Additional information has been requested by the Government. Please check your email for instructions.",                                          icon: Landmark,      color: "text-indigo-700",  bg: "bg-indigo-50 border-indigo-300"  },
  approved:                 { label: "Approved",                 message: "Your eVisa has been sent to your email address.",                                                                                                 icon: CheckCircle2,  color: "text-green-700",   bg: "bg-green-50 border-green-200"    },
  rejected:         { label: "Denied",       message: "A notification has been sent to your email with further information.",            icon: XCircle,       color: "text-red-700",    bg: "bg-red-50 border-red-200"      },
};

const Status = () => {
  const [searchParams] = useSearchParams();
  const [emailInput, setEmailInput] = useState("");
  const [refInput, setRefInput] = useState(() => searchParams.get("ref") ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ reference: string; status: AppStatus } | null>(null);
  const [error, setError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    const reference = refInput.trim().toUpperCase();
    if (!email || !reference) return;

    if (!checkRateLimit()) {
      setError("Too many searches. Please wait a moment and try again.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(
        `${API_URL}/api/public/status?reference=${encodeURIComponent(reference)}&email=${encodeURIComponent(email)}`
      );
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setResult({ reference: json.reference, status: json.status });
      } else {
        setError("No matching application found. Please check your email and reference number and try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const ui = result ? STATUS_UI[result.status] : null;

  return (
    <>
      <PageSEO
        title="Check Somalia eVisa Application Status | eVisaSomali"
        description="Track your Somalia eVisa application status. Enter your email address and reference number to check where your application stands."
        canonical="https://www.evisasomali.com/status"
      />
      <section className="container py-20 max-w-2xl">
        <SectionHeading
          eyebrow="Track"
          title="Check your application status"
          description="Enter your email address and reference number to see the latest update on your eVisa."
        />

        <form onSubmit={lookup} className="mt-12 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={emailRef}
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Email address"
              required
              className="w-full rounded-sm border border-input bg-card pl-11 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="Application reference (e.g. SOM-123456)"
              required
              className="w-full rounded-sm border border-input bg-card pl-11 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-sm bg-gradient-navy px-8 py-4 text-sm font-medium text-primary-foreground shadow-card hover:shadow-elegant transition-smooth disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Searching…</> : "Check Status"}
          </button>
        </form>

        {error && (
          <div className="mt-8 rounded-sm border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {result && ui && (
          <div className={`mt-10 rounded-sm border px-8 py-7 ${ui.bg}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <ui.icon className={`h-7 w-7 shrink-0 ${ui.color}`} />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Reference {result.reference}</div>
                  <div className={`mt-0.5 font-serif text-2xl ${ui.color}`}>{ui.label}</div>
                </div>
              </div>
              {result.status === "government_info_required" && (
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-indigo-100 border border-indigo-300 px-3 py-1 text-[10px] uppercase tracking-widest text-indigo-700 font-semibold">
                  <Landmark className="h-3 w-3" /> Government
                </span>
              )}
              {result.status === "additional_info" && (
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-[10px] uppercase tracking-widest text-amber-700 font-semibold">
                  <AlertTriangle className="h-3 w-3" /> From Us
                </span>
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground/80">{ui.message}</p>
          </div>
        )}
      </section>
    </>
  );
};

export default Status;

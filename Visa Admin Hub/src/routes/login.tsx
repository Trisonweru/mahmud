import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Somalia eVisa Admin" }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Min 8 characters").max(72),
});

function isInviteOrRecovery() {
  if (typeof window === "undefined") return false;
  const h = window.location.hash;
  return h.includes("type=invite") || h.includes("type=recovery");
}

// Capture hash at module load time — before Supabase client processes and clears it.
// SSR evaluates this as false (no window); the client bundle re-evaluates on page load.
const INITIAL_INVITE_OR_RECOVERY = isInviteOrRecovery();

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
let attemptCount = 0;
let windowStart = Date.now();

function checkRateLimit(): { allowed: boolean; waitSeconds: number } {
  const now = Date.now();
  if (now - windowStart > RATE_LIMIT_WINDOW_MS) { attemptCount = 0; windowStart = now; }
  attemptCount++;
  if (attemptCount > RATE_LIMIT_MAX) {
    return { allowed: false, waitSeconds: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - windowStart)) / 1000) };
  }
  return { allowed: true, waitSeconds: 0 };
}

function LoginPage() {
  const nav = useNavigate();
  const { session, loading } = useAuth();

  const [mode, setMode] = useState<"signin" | "set_password">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  // After hydration: apply invite/recovery mode and guard navigation
  useEffect(() => {
    if (INITIAL_INVITE_OR_RECOVERY) setMode("set_password");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading && session && mode !== "set_password" && !INITIAL_INVITE_OR_RECOVERY) {
      nav({ to: "/" });
    }
  }, [loading, session, nav, mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    const { allowed, waitSeconds } = checkRateLimit();
    if (!allowed) { toast.error(`Too many attempts. Try again in ${waitSeconds}s.`); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const submitSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password set — welcome to the console!");
      nav({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-navy px-4">
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-info/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white shadow-elegant">
          {/* Top accent gradient */}
          <div className="h-1 w-full bg-gradient-gold" />

          <div className="px-8 py-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-navy shadow-elegant">
                <ShieldCheck className="h-6 w-6 text-accent" />
              </div>
              <div>
                <div className="font-serif text-xl font-semibold text-foreground">Somalia eVisa</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Staff Console</div>
              </div>
            </div>

            {mode === "set_password" ? (
              <>
                <h1 className="mt-8 font-serif text-3xl text-foreground">Set your password</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a password to activate your staff account.
                </p>
                <form onSubmit={submitSetPassword} className="mt-6 space-y-4">
                  <Field label="New password">
                    <input
                      type={showPw ? "text" : "password"}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 pr-10"
                      placeholder="Min 8 characters"
                    />
                    <ShowToggle show={showPw} onToggle={() => setShowPw(v => !v)} />
                  </Field>
                  <Field label="Confirm password">
                    <input
                      type={showPw ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                  </Field>
                  <SubmitBtn busy={busy} label="Activate account" />
                </form>
              </>
            ) : (
              <>
                <h1 className="mt-8 font-serif text-3xl text-foreground">Sign in</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Use your staff credentials to access the console.
                </p>
                <form onSubmit={submit} className="mt-6 space-y-4">
                  <Field label="Email">
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field label="Password">
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                      />
                      <ShowToggle show={showPw} onToggle={() => setShowPw(v => !v)} />
                    </div>
                  </Field>
                  <SubmitBtn busy={busy} label="Sign in" />
                </form>
                <p className="mt-6 text-center text-[11px] text-muted-foreground">
                  Staff accounts are created by invitation only.
                </p>
              </>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-white/30">
          Somalia eVisa Administration Portal
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="relative">{children}</div>
    </div>
  );
}

function ShowToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

function SubmitBtn({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      disabled={busy}
      type="submit"
      className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-navy px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-card hover:shadow-elegant transition-all disabled:opacity-60"
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}

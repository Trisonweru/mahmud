import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { requestPasswordReset, recordPasswordSet } from "@/lib/staff.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Kenya eTA Admin" }] }),
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

const INITIAL_INVITE_OR_RECOVERY = isInviteOrRecovery();
const INITIAL_IS_RECOVERY = typeof window !== "undefined" && window.location.hash.includes("type=recovery");

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
let attemptCount = 0;
let windowStart = Date.now();

function checkRateLimit(): { allowed: boolean; waitSeconds: number } {
  const now = Date.now();
  if (now - windowStart > RATE_LIMIT_WINDOW_MS) {
    attemptCount = 0;
    windowStart = now;
  }
  attemptCount++;
  if (attemptCount > RATE_LIMIT_MAX) {
    return {
      allowed: false,
      waitSeconds: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - windowStart)) / 1000),
    };
  }
  return { allowed: true, waitSeconds: 0 };
}

type Mode = "signin" | "set_password" | "forgot";

function LoginPage() {
  const nav = useNavigate();
  const { session, loading } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const sendReset = useServerFn(requestPasswordReset);
  const recordSet = useServerFn(recordPasswordSet);

  const [inviteSessionState, setInviteSessionState] = useState<"checking" | "ready" | "missing">(
    INITIAL_INVITE_OR_RECOVERY ? "checking" : "ready",
  );

  useEffect(() => {
    if (INITIAL_INVITE_OR_RECOVERY) setMode("set_password");
  }, []);

  useEffect(() => {
    if (!loading && session && mode !== "set_password" && !INITIAL_INVITE_OR_RECOVERY) {
      nav({ to: "/" });
    }
  }, [loading, session, nav, mode]);

  useEffect(() => {
    if (!INITIAL_INVITE_OR_RECOVERY) return;
    let resolved = false;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (authSession && !resolved) {
        resolved = true;
        setInviteSessionState("ready");
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !resolved) {
        resolved = true;
        setInviteSessionState("ready");
      }
    });
    const timeout = setTimeout(() => {
      if (!resolved) setInviteSessionState("missing");
    }, 6000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    const { allowed, waitSeconds } = checkRateLimit();
    if (!allowed) {
      toast.error(`Too many attempts. Try again in ${waitSeconds}s.`);
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error) throw error;
      nav({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().trim().email("Enter a valid email").max(255).safeParse(email);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid email"); return; }
    const { allowed, waitSeconds } = checkRateLimit();
    if (!allowed) { toast.error(`Too many attempts. Try again in ${waitSeconds}s.`); return; }
    setBusy(true);
    try {
      await sendReset({ data: { email: parsed.data } });
      setResetSent(true);
    } catch {
      toast.error("Could not send the reset link. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteSessionState !== "ready") {
      toast.error("Please wait for your invite to finish loading.");
      return;
    }
    if (newPassword.length < 10 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) { toast.error("Password must be at least 10 characters and include a letter and a number"); return; }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      recordSet({ data: { kind: INITIAL_IS_RECOVERY ? "recovery" : "invite" } }).catch(() => undefined);
      toast.success(INITIAL_IS_RECOVERY ? "Password updated — you are signed in." : "Password set — welcome to the console!");
      nav({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-navy px-4">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-info/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white shadow-elegant">
          <div className="h-1 w-full bg-gradient-gold" />

          <div className="px-8 py-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-navy shadow-elegant">
                <ShieldCheck className="h-6 w-6 text-accent" />
              </div>
              <div>
                <div className="font-serif text-xl font-semibold text-foreground">Kenya eTA</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  Staff Console
                </div>
              </div>
            </div>

            {mode === "set_password" && (
              <>
                <h1 className="mt-8 font-serif text-3xl text-foreground">Set your password</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {INITIAL_IS_RECOVERY ? "Choose a new password for your staff account." : "Choose a password to activate your staff account."}
                </p>
                {inviteSessionState === "checking" && (
                  <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing your account…
                  </div>
                )}
                {inviteSessionState === "missing" && (
                  <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    This invite link has expired or has already been used. Please ask an
                    administrator to send you a new invite.
                  </div>
                )}
                {inviteSessionState === "ready" && (
                  <form onSubmit={submitSetPassword} className="mt-6 space-y-4">
                    <Field label="New password">
                      <input
                        type={showPw ? "text" : "password"}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 pr-10"
                        placeholder="Min 10 characters, letters + numbers"
                      />
                      <ShowToggle show={showPw} onToggle={() => setShowPw((v) => !v)} />
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
                    <SubmitBtn busy={busy} label={INITIAL_IS_RECOVERY ? "Save new password" : "Activate account"} />
                  </form>
                )}
              </>
            )}

            {mode === "forgot" && (
              <>
                <h1 className="mt-8 font-serif text-3xl text-foreground">Reset password</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Enter your staff email. If it belongs to an active account, we will send a secure link to choose a new password.
                </p>
                {resetSent ? (
                  <div className="mt-6 rounded-md border border-success/30 bg-success/5 p-4 text-sm text-foreground">
                    If an active staff account exists for <strong>{email}</strong>, a reset link is on its way. The link expires after one hour.
                  </div>
                ) : (
                  <form onSubmit={submitForgot} className="mt-6 space-y-4">
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
                    <SubmitBtn busy={busy} label="Send reset link" />
                  </form>
                )}
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setResetSent(false); }}
                  className="mt-6 block w-full text-center text-xs text-muted-foreground hover:text-foreground"
                >
                  ← Back to sign in
                </button>
              </>
            )}

            {mode === "signin" && (
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
                      <ShowToggle show={showPw} onToggle={() => setShowPw((v) => !v)} />
                    </div>
                  </Field>
                  <SubmitBtn busy={busy} label="Sign in" />
                </form>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="mt-3 block w-full text-center text-xs text-accent hover:underline"
                >
                  Forgot password?
                </button>
                <p className="mt-6 text-center text-[11px] text-muted-foreground">
                  Staff accounts are created by invitation only.
                </p>
              </>
            )}

          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-white/30">
          Kenya eTA Administration Portal
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
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

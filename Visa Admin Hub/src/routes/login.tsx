import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, Eye, EyeOff, KeyRound } from "lucide-react";
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

type Mode = "signin" | "set_password" | "mfa_totp" | "mfa_enroll";

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
  const [totpCode, setTotpCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [enrollData, setEnrollData] = useState<{ qr_code: string; secret: string } | null>(null);
  const [enrollFactorId, setEnrollFactorId] = useState("");

  const [inviteSessionState, setInviteSessionState] = useState<"checking" | "ready" | "missing">(
    INITIAL_INVITE_OR_RECOVERY ? "checking" : "ready"
  );

  useEffect(() => {
    if (INITIAL_INVITE_OR_RECOVERY) setMode("set_password");
  }, []);

  useEffect(() => {
    if (!loading && session && mode !== "set_password" && mode !== "mfa_totp" && mode !== "mfa_enroll" && !INITIAL_INVITE_OR_RECOVERY) {
      nav({ to: "/" });
    }
  }, [loading, session, nav, mode]);

  useEffect(() => {
    if (!INITIAL_INVITE_OR_RECOVERY) return;
    let resolved = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, authSession) => {
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
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    const { allowed, waitSeconds } = checkRateLimit();
    if (!allowed) { toast.error(`Too many attempts. Try again in ${waitSeconds}s.`); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
      if (error) throw error;

      // Check MFA status after successful password auth
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactors = factors?.totp ?? [];
      const verifiedTotp = totpFactors.filter((f) => f.status === "verified");
      const unverifiedTotp = totpFactors.filter((f) => f.status === "unverified");

      if (verifiedTotp.length > 0) {
        // User has a verified TOTP factor — require verification
        setMfaFactorId(verifiedTotp[0].id);
        setMode("mfa_totp");
      } else {
        // Clean up any stale unverified factors before enrolling fresh
        for (const factor of unverifiedTotp) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
        const { data: enroll, error: enrollErr } = await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Authenticator App",
        });
        if (enrollErr || !enroll) throw enrollErr ?? new Error("Failed to start MFA enrollment");
        setEnrollFactorId(enroll.id);
        setEnrollData({ qr_code: enroll.totp.qr_code, secret: enroll.totp.secret });
        setMode("mfa_enroll");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const submitTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) { toast.error("Enter the 6-digit code from your authenticator app"); return; }
    setBusy(true);
    try {
      const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challengeErr || !challenge) throw challengeErr ?? new Error("Failed to start MFA challenge");
      const { error } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.id, code: totpCode });
      if (error) throw error;
      nav({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid code. Try again.");
      setTotpCode("");
    } finally {
      setBusy(false);
    }
  };

  const submitEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) { toast.error("Enter the 6-digit code to confirm setup"); return; }
    setBusy(true);
    try {
      const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId: enrollFactorId });
      if (challengeErr || !challenge) throw challengeErr ?? new Error("Failed to start MFA challenge");
      const { error } = await supabase.auth.mfa.verify({ factorId: enrollFactorId, challengeId: challenge.id, code: totpCode });
      if (error) throw error;
      toast.success("Two-factor authentication enabled!");
      nav({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid code. Please scan the QR code again and retry.");
      setTotpCode("");
    } finally {
      setBusy(false);
    }
  };

  const submitSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteSessionState !== "ready") { toast.error("Please wait for your invite to finish loading."); return; }
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
                <div className="font-serif text-xl font-semibold text-foreground">Somalia eVisa</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Staff Console</div>
              </div>
            </div>

            {mode === "set_password" && (
              <>
                <h1 className="mt-8 font-serif text-3xl text-foreground">Set your password</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a password to activate your staff account.
                </p>
                {inviteSessionState === "checking" && (
                  <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing your account…
                  </div>
                )}
                {inviteSessionState === "missing" && (
                  <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    This invite link has expired or has already been used. Please ask an administrator to send you a new invite.
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
                )}
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

            {mode === "mfa_totp" && (
              <>
                <div className="mt-8 flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-accent" />
                  <h1 className="font-serif text-2xl text-foreground">Two-factor verification</h1>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app.
                </p>
                <form onSubmit={submitTotp} className="mt-6 space-y-4">
                  <Field label="Authenticator code">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-accent/40"
                      placeholder="000000"
                    />
                  </Field>
                  <SubmitBtn busy={busy} label="Verify" />
                </form>
                <button
                  type="button"
                  className="mt-4 w-full text-center text-[11px] text-muted-foreground hover:underline"
                  onClick={() => { setMode("signin"); setTotpCode(""); }}
                >
                  Back to sign in
                </button>
              </>
            )}

            {mode === "mfa_enroll" && enrollData && (
              <>
                <div className="mt-8 flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-accent" />
                  <h1 className="font-serif text-2xl text-foreground">Set up two-factor auth</h1>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.), then enter the 6-digit code to confirm.
                </p>
                <div className="mt-4 flex justify-center">
                  <img
                    src={enrollData.qr_code}
                    alt="TOTP QR code"
                    className="h-40 w-40 rounded-md border border-border"
                  />
                </div>
                <details className="mt-2 text-center">
                  <summary className="cursor-pointer text-[11px] text-muted-foreground hover:underline">
                    Can't scan? Enter code manually
                  </summary>
                  <p className="mt-1 break-all rounded-md bg-muted px-3 py-2 font-mono text-[11px] text-foreground">
                    {enrollData.secret}
                  </p>
                </details>
                <form onSubmit={submitEnroll} className="mt-4 space-y-4">
                  <Field label="Confirm code from app">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-accent/40"
                      placeholder="000000"
                    />
                  </Field>
                  <SubmitBtn busy={busy} label="Enable two-factor auth" />
                </form>
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

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_API = "https://api.resend.com/emails";
const DEFAULT_FROM = "eVisaSomali <support@evisasomali.com>";

// Email sending is a side effect of payment confirmation, never the reason a
// webhook fails — callers should not let a send error affect the response
// Stripe receives, so failures are logged here rather than thrown.
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.error("[resend] RESEND_API_KEY not configured — skipping email send.");
    return;
  }
  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: params.from ?? DEFAULT_FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });
    if (!res.ok) {
      console.error(`[resend] Send failed (${res.status}):`, await res.text());
    }
  } catch (err) {
    console.error("[resend] Send threw:", (err as Error).message);
  }
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_API = "https://api.resend.com/emails";
const DEFAULT_FROM = "eVisa Somalia <support@evisasomali.com>";

// Email sending is a side effect of payment confirmation, never the reason a
// webhook fails — callers should not let a send error affect the response
// Stripe receives, so failures are logged here rather than thrown.
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("[resend] RESEND_API_KEY not configured — skipping email send.");
    return false;
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
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error(`[resend] Send failed (${res.status}):`, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[resend] Send threw:", (err as Error).message);
    return false;
  }
}

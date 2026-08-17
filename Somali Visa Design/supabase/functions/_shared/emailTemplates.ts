const SITE_URL = "https://www.evisasomali.com";
const BRAND_GOLD = "#c9a227";
const BRAND_NAVY = "#0b1f3a";

function wrapper(bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:4px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND_NAVY};padding:24px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:600;letter-spacing:0.02em;">eVisaSomali</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1a1a1a;font-size:14px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f5f6f8;color:#6b7280;font-size:12px;line-height:1.5;">
                eVisaSomali.com, a trading name of Passkey Technologies Limited (Company No. 16877709).
                Independent third-party service — not affiliated with the Somali government.<br />
                Questions? Reply to this email or WhatsApp us at +252 61 3886027.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();
}

export function paymentConfirmationEmail(params: { fullName: string; reference: string }): string {
  const statusUrl = `${SITE_URL}/status?ref=${encodeURIComponent(params.reference)}`;
  return wrapper(`
    <h1 style="margin:0 0 16px;font-size:20px;color:${BRAND_NAVY};">Payment confirmed</h1>
    <p style="margin:0 0 16px;">Hi ${escapeHtml(params.fullName || "there")},</p>
    <p style="margin:0 0 16px;">
      Your payment has been received and your Somalia eVisa application is now being processed.
      Your reference number is:
    </p>
    <p style="margin:0 0 20px;padding:12px 16px;background:#f5f6f8;border-left:3px solid ${BRAND_GOLD};font-family:monospace;font-size:15px;font-weight:600;">
      ${escapeHtml(params.reference)}
    </p>
    <p style="margin:0 0 20px;">
      We will review your application and begin processing it right away.
      You can track its progress at any time using the link below.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${statusUrl}" style="display:inline-block;background:${BRAND_GOLD};color:#1a1a1a;text-decoration:none;padding:12px 24px;border-radius:2px;font-weight:600;">
        Track your application
      </a>
    </p>
    <p style="margin:0;color:#6b7280;">
      We'll also send updates by WhatsApp and email as your application progresses.
    </p>
  `);
}

export function refundConfirmationEmail(params: { fullName: string; reference: string; amount: number }): string {
  const statusUrl = `${SITE_URL}/status?ref=${encodeURIComponent(params.reference)}`;
  return wrapper(`
    <h1 style="margin:0 0 16px;font-size:20px;color:${BRAND_NAVY};">Refund processed</h1>
    <p style="margin:0 0 16px;">Hi ${escapeHtml(params.fullName || "there")},</p>
    <p style="margin:0 0 16px;">
      We've processed a refund of <strong>$${params.amount.toFixed(2)} USD</strong> for your application.
      Your reference number is:
    </p>
    <p style="margin:0 0 20px;padding:12px 16px;background:#f5f6f8;border-left:3px solid ${BRAND_GOLD};font-family:monospace;font-size:15px;font-weight:600;">
      ${escapeHtml(params.reference)}
    </p>
    <p style="margin:0 0 20px;">
      Please allow a few business days for the refund to appear on your original payment method's statement.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${statusUrl}" style="display:inline-block;background:${BRAND_GOLD};color:#1a1a1a;text-decoration:none;padding:12px 24px;border-radius:2px;font-weight:600;">
        View application status
      </a>
    </p>
    <p style="margin:0;color:#6b7280;">
      If you have any questions about this refund, just reply to this email or reach us on WhatsApp.
    </p>
  `);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

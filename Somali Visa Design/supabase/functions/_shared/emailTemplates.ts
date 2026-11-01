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
                <span style="color:#ffffff;font-size:18px;font-weight:600;letter-spacing:0.02em;">eVisaSomalia</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1a1a1a;font-size:14px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();
}

// Always derived from applications.processing_speed — never applications.type,
// which records the form used (quick-apply vs guided), not the speed paid for.
export function processingLabel(processingSpeed: string | null | undefined): "Standard" | "Express" {
  return processingSpeed === "express" ? "Express" : "Standard";
}

function referenceBlock(reference: string, processingSpeed?: string | null): string {
  const processing = processingSpeed === undefined
    ? ""
    : `<div style="margin-top:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;font-weight:400;color:#4b5563;">${processingLabel(processingSpeed)} processing</div>`;
  return `
    <p style="margin:0 0 20px;padding:12px 16px;background:#f5f6f8;border-left:3px solid ${BRAND_GOLD};font-family:monospace;font-size:15px;font-weight:600;">
      ${escapeHtml(reference)}${processing}
    </p>`;
}

export function applicationReceivedEmail(params: { fullName: string; reference: string; processingSpeed: string | null }): string {
  const statusUrl = `${SITE_URL}/status?ref=${encodeURIComponent(params.reference)}`;
  return wrapper(`
    <h1 style="margin:0 0 16px;font-size:20px;color:${BRAND_NAVY};">Application received</h1>
    <p style="margin:0 0 16px;">Hi ${escapeHtml(params.fullName || "there")},</p>
    <p style="margin:0 0 16px;">
      Thank you for submitting your Somalia eVisa application. Your reference number is:
    </p>
    ${referenceBlock(params.reference, params.processingSpeed)}
    <p style="margin:0 0 20px;">
      Processing begins as soon as your payment is complete. If you haven't finished paying yet,
      please return to the payment page to complete it — you'll receive a payment confirmation email once it goes through.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${statusUrl}" style="display:inline-block;background:${BRAND_GOLD};color:#1a1a1a;text-decoration:none;padding:12px 24px;border-radius:2px;font-weight:600;">
        Track your application
      </a>
    </p>
    <p style="margin:0;color:#6b7280;">
      Please keep your reference number — you'll need it to track your application or contact us.
    </p>
  `);
}

export function applicationRejectedEmail(params: { fullName: string; reference: string; refundRequested: boolean }): string {
  const statusUrl = `${SITE_URL}/status?ref=${encodeURIComponent(params.reference)}`;
  const refundLine = params.refundRequested
    ? `<p style="margin:0 0 20px;">A refund of your payment has been requested. You'll receive a separate email once it has been issued; please allow a few business days for it to appear on your statement.</p>`
    : "";
  return wrapper(`
    <h1 style="margin:0 0 16px;font-size:20px;color:${BRAND_NAVY};">Update on your eVisa application</h1>
    <p style="margin:0 0 16px;">Hi ${escapeHtml(params.fullName || "there")},</p>
    <p style="margin:0 0 16px;">
      We're sorry to let you know that your Somalia eVisa application could not be approved.
      Your reference number is:
    </p>
    ${referenceBlock(params.reference)}
    ${refundLine}
    <p style="margin:0 0 24px;">
      <a href="${statusUrl}" style="display:inline-block;background:${BRAND_GOLD};color:#1a1a1a;text-decoration:none;padding:12px 24px;border-radius:2px;font-weight:600;">
        View application status
      </a>
    </p>
    <p style="margin:0;color:#6b7280;">
      If you have any questions about this decision, just reply to this email or reach us on WhatsApp.
    </p>
  `);
}

export function paymentConfirmationEmail(params: { fullName: string; reference: string; processingSpeed?: string | null }): string {
  const statusUrl = `${SITE_URL}/status?ref=${encodeURIComponent(params.reference)}`;
  return wrapper(`
    <h1 style="margin:0 0 16px;font-size:20px;color:${BRAND_NAVY};">Payment confirmed</h1>
    <p style="margin:0 0 16px;">Hi ${escapeHtml(params.fullName || "there")},</p>
    <p style="margin:0 0 16px;">
      Your payment has been received and your Somalia eVisa application is now being processed.
      Your reference number is:
    </p>
    ${referenceBlock(params.reference, params.processingSpeed)}
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

export function refundConfirmationEmail(params: { fullName: string; reference: string }): string {
  const statusUrl = `${SITE_URL}/status?ref=${encodeURIComponent(params.reference)}`;
  return wrapper(`
    <h1 style="margin:0 0 16px;font-size:20px;color:${BRAND_NAVY};">Refund initiated</h1>
    <p style="margin:0 0 16px;">Hi ${escapeHtml(params.fullName || "there")},</p>
    <p style="margin:0 0 16px;">
      We've initiated a refund for your application and you'll receive it shortly.
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

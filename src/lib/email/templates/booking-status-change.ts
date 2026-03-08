/**
 * Booking status change email template.
 * Sent to the customer when admin changes booking status to Confirmed or Cancelled.
 */

export type BookingStatusChangeData = {
  agencyName: string;
  agencyLogoUrl?: string;
  agencyEmail?: string;
  agencyPhone?: string;
  bookingId: string;
  customerName: string;
  newStatus: 'Confirmed' | 'Cancelled';
  totalPrice: number;
  currency?: string;
  items: Array<{
    name: string;
    packageName?: string;
    adults?: number;
    children?: number;
    date?: string;
  }>;
};

export function renderBookingStatusChangeEmail(data: BookingStatusChangeData): string {
  const {
    agencyName,
    agencyLogoUrl,
    agencyEmail,
    agencyPhone,
    bookingId,
    customerName,
    newStatus,
    totalPrice,
    currency = 'USD',
    items,
  } = data;

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  const isConfirmed = newStatus === 'Confirmed';

  const headerBg = isConfirmed
    ? 'linear-gradient(135deg,#14532d,#16a34a)'
    : 'linear-gradient(135deg,#7f1d1d,#dc2626)';

  const statusIcon = isConfirmed ? '🎉' : '❌';
  const statusTitle = isConfirmed ? 'Your Booking is Confirmed!' : 'Booking Cancelled';
  const statusMessage = isConfirmed
    ? `Great news, ${customerName}! Your booking has been confirmed. We look forward to seeing you!`
    : `We're sorry, ${customerName}. Your booking has been cancelled. If you have any questions, please contact us.`;

  const itemsHtml = items
    .map((item) => {
      const pax = [
        item.adults ? `${item.adults} adult${item.adults > 1 ? 's' : ''}` : '',
        item.children ? `${item.children} child${item.children > 1 ? 'ren' : ''}` : '',
      ]
        .filter(Boolean)
        .join(', ');
      return `
        <li style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px;">
          <strong style="color:#111;">${item.name}</strong>
          ${item.packageName ? ` — ${item.packageName}` : ''}
          ${pax ? `<br><small>${pax}</small>` : ''}
          ${item.date ? `<br><small>📅 ${new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</small>` : ''}
        </li>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${statusTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${headerBg};padding:32px 40px;text-align:center;">
            ${agencyLogoUrl ? `<img src="${agencyLogoUrl}" alt="${agencyName}" style="max-height:44px;max-width:180px;margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;" />` : ''}
            <div style="font-size:48px;margin-bottom:8px;">${statusIcon}</div>
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">${statusTitle}</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">${agencyName}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="font-size:15px;color:#555;margin:0 0 24px;">${statusMessage}</p>

            <!-- Booking Reference -->
            <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
              <span style="font-size:12px;text-transform:uppercase;color:#888;letter-spacing:0.5px;">Booking Reference</span>
              <br><strong style="font-size:18px;font-family:monospace;color:#111;">#${bookingId.substring(0, 8).toUpperCase()}</strong>
              <span style="float:right;margin-top:4px;background:${isConfirmed ? '#16a34a' : '#dc2626'};color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">${newStatus}</span>
            </div>

            <!-- Items -->
            <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.5px;color:#888;margin:0 0 12px;">Booking Details</h3>
            <ul style="list-style:none;padding:0;margin:0 0 20px;border:1px solid #e5e7eb;border-radius:8px;padding:0 16px;overflow:hidden;">
              ${itemsHtml}
            </ul>

            <!-- Total -->
            <div style="background:#f9fafb;border-radius:8px;padding:14px 20px;display:flex;justify-content:space-between;">
              <table width="100%"><tr>
                <td style="font-weight:700;font-size:15px;color:#111;">Total</td>
                <td style="text-align:right;font-weight:700;font-size:16px;color:#2563eb;">${fmt(totalPrice)}</td>
              </tr></table>
            </div>

            ${
              isConfirmed && (agencyEmail || agencyPhone)
                ? `
            <div style="margin-top:24px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 18px;font-size:14px;color:#166534;">
              <strong>Need to reach us?</strong>
              ${agencyEmail ? `<br>📧 <a href="mailto:${agencyEmail}" style="color:#166534;">${agencyEmail}</a>` : ''}
              ${agencyPhone ? `<br>📞 ${agencyPhone}` : ''}
            </div>`
                : ''
            }

            ${
              !isConfirmed && (agencyEmail || agencyPhone)
                ? `
            <div style="margin-top:24px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;font-size:14px;color:#991b1b;">
              <strong>Questions about this cancellation?</strong>
              ${agencyEmail ? `<br>📧 <a href="mailto:${agencyEmail}" style="color:#991b1b;">${agencyEmail}</a>` : ''}
              ${agencyPhone ? `<br>📞 ${agencyPhone}` : ''}
            </div>`
                : ''
            }

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:18px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#aaa;font-size:12px;margin:0;">This email was sent by ${agencyName}. Please do not reply.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

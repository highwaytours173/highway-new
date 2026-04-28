/**
 * Sent to the customer the moment an online booking flips from
 * Pending to Confirmed (i.e. payment was successfully captured by Kashier).
 */

export type BookingPaymentConfirmedData = {
  agencyName: string;
  agencyLogoUrl?: string;
  agencyEmail?: string;
  agencyPhone?: string;
  bookingId: string;
  customerName: string;
  paymentMethod: 'cash' | 'online';
  totalPrice: number;
  currency?: string;
  items: Array<{
    name: string;
    packageName?: string;
    adults?: number;
    children?: number;
    date?: string;
    price?: number;
  }>;
  voucherUrl?: string;
};

export function renderBookingPaymentConfirmedEmail(data: BookingPaymentConfirmedData): string {
  const {
    agencyName,
    agencyLogoUrl,
    agencyEmail,
    agencyPhone,
    bookingId,
    customerName,
    paymentMethod,
    totalPrice,
    currency = 'USD',
    items,
    voucherUrl,
  } = data;

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  const shortRef = bookingId.substring(0, 8).toUpperCase();
  const methodLabel = paymentMethod === 'online' ? 'Online Payment (Kashier)' : 'Cash on Arrival';

  const itemsHtml = items
    .map((item) => {
      const pax = [
        item.adults ? `${item.adults} adult${item.adults > 1 ? 's' : ''}` : '',
        item.children ? `${item.children} child${item.children > 1 ? 'ren' : ''}` : '',
      ]
        .filter(Boolean)
        .join(', ');
      const dateStr = item.date
        ? new Date(item.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : '';
      const priceStr = typeof item.price === 'number' ? fmt(item.price) : '';
      return `
        <tr>
          <td style="padding:14px 16px;border-bottom:1px solid #f1f1f1;vertical-align:top;">
            <div style="font-weight:600;color:#111;font-size:14px;">${item.name}</div>
            ${item.packageName ? `<div style="color:#666;font-size:12px;margin-top:2px;">${item.packageName}</div>` : ''}
            ${pax ? `<div style="color:#666;font-size:12px;margin-top:2px;">👥 ${pax}</div>` : ''}
            ${dateStr ? `<div style="color:#666;font-size:12px;margin-top:2px;">📅 ${dateStr}</div>` : ''}
          </td>
          ${priceStr ? `<td style="padding:14px 16px;border-bottom:1px solid #f1f1f1;text-align:right;font-family:monospace;color:#111;font-size:14px;white-space:nowrap;vertical-align:top;">${priceStr}</td>` : ''}
        </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payment Received</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#15803d,#22c55e);padding:36px 40px;text-align:center;">
              ${agencyLogoUrl ? `<img src="${agencyLogoUrl}" alt="${agencyName}" style="max-height:44px;max-width:180px;margin-bottom:18px;display:block;margin-left:auto;margin-right:auto;" />` : ''}
              <div style="font-size:48px;line-height:1;margin-bottom:10px;">✅</div>
              <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.2px;">Payment Received — Booking Confirmed</h1>
              <p style="color:rgba(255,255,255,0.92);margin:8px 0 0;font-size:13px;">${agencyName}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px 8px;">
              <p style="font-size:15px;color:#444;margin:0 0 16px;">Hi <strong>${customerName}</strong>,</p>
              <p style="font-size:15px;color:#444;margin:0 0 24px;line-height:1.55;">
                Great news — we've received your payment and your booking is now <strong style="color:#15803d;">confirmed</strong>.
                Get ready for an unforgettable experience!
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <div style="font-size:11px;text-transform:uppercase;color:#166534;letter-spacing:0.6px;font-weight:600;">Booking Reference</div>
                    <div style="font-size:18px;color:#111;font-family:monospace;font-weight:700;margin-top:2px;">#${shortRef}</div>
                  </td>
                  <td style="padding:16px 20px;text-align:right;">
                    <div style="font-size:11px;text-transform:uppercase;color:#166534;letter-spacing:0.6px;font-weight:600;">Total Paid</div>
                    <div style="font-size:18px;color:#111;font-family:monospace;font-weight:700;margin-top:2px;">${fmt(totalPrice)}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:0 20px 16px;font-size:12px;color:#15803d;">
                    💳 ${methodLabel}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 16px;">
              <div style="font-size:13px;font-weight:700;color:#111;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:10px;">Your Booking</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:10px;overflow:hidden;">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          ${
            voucherUrl
              ? `<tr>
            <td style="padding:8px 40px 32px;text-align:center;">
              <a href="${voucherUrl}" style="display:inline-block;background:#15803d;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                📄 Download Voucher
              </a>
            </td>
          </tr>`
              : ''
          }

          <tr>
            <td style="padding:0 40px 32px;">
              <p style="font-size:13px;color:#666;margin:0 0 8px;line-height:1.6;">
                Need to reach us about this booking? We're happy to help.
              </p>
              <p style="font-size:13px;color:#666;margin:0;line-height:1.7;">
                ${agencyEmail ? `📧 <a href="mailto:${agencyEmail}" style="color:#2563eb;text-decoration:none;">${agencyEmail}</a><br />` : ''}
                ${agencyPhone ? `📞 ${agencyPhone}` : ''}
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb;padding:16px 40px;text-align:center;font-size:12px;color:#888;border-top:1px solid #eee;">
              ${agencyName} · Booking #${shortRef}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

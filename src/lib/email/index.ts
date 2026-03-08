/**
 * Core email sending utility.
 *
 * Priority:
 *  1. Agency's own Resend API key (stored in agency settings → emailSettings.resendApiKey)
 *  2. System-level RESEND_API_KEY env variable (platform default / white-label mode)
 *
 * The `from` address is determined by:
 *  1. Agency's configured fromEmail / fromName in emailSettings
 *  2. System RESEND_FROM_EMAIL / RESEND_FROM_NAME env variables
 *  3. Built-in fallback "noreply@tixandtrips.com"
 */

import { Resend } from 'resend';

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  /** Override the "from" display name for this send */
  fromName?: string;
  /** Resolved agency email settings (pass in to avoid a DB round-trip) */
  agencyEmailSettings?: {
    resendApiKey?: string;
    fromName?: string;
    fromEmail?: string;
  };
};

export async function sendEmail(opts: SendEmailOptions): Promise<{ ok: boolean; error?: string }> {
  const { to, subject, html, agencyEmailSettings } = opts;

  const apiKey = agencyEmailSettings?.resendApiKey?.trim() || process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    // No API key configured — silently skip rather than throwing
    console.warn('[email] No Resend API key configured. Email not sent.');
    return { ok: false, error: 'No Resend API key configured' };
  }

  const fromName =
    opts.fromName ||
    agencyEmailSettings?.fromName?.trim() ||
    process.env.RESEND_FROM_NAME?.trim() ||
    'Booking Confirmation';

  const fromEmail =
    agencyEmailSettings?.fromEmail?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'noreply@tixandtrips.com';

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[email] Resend error:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[email] Failed to send email:', message);
    return { ok: false, error: message };
  }
}

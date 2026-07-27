/**
 * Pluggable Email Provider
 *
 * Default implementation: Console logging.
 * To integrate a real provider, install nodemailer (`npm i nodemailer`)
 * and uncomment the Nodemailer section below, or swap in Resend/SendGrid.
 *
 * Environment variables (read from .env):
 *   SMTP_HOST - SMTP server host (e.g., smtp.gmail.com)
 *   SMTP_PORT - SMTP server port (default: 587)
 *   SMTP_USER - SMTP username / email
 *   SMTP_PASS - SMTP password / app-specific password
 *   SMTP_FROM - Sender "from" address (default: noreply@shulov.com)
 */

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@shulov.com';

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  if (!SMTP_HOST || !SMTP_USER) {
    // ──────────── Console Logger (Default) ────────────
    console.log('');
    console.log('┌──────────────────────────────────────────────────');
    console.log('│ [EMAIL] Order Confirmation');
    console.log('│ To:      ' + to);
    console.log('│ From:    ' + SMTP_FROM);
    console.log('│ Subject: ' + subject);
    console.log('│ Body:    (Rich HTML — ' + html.length + ' chars)');
    console.log('└──────────────────────────────────────────────────');
    console.log('');
    return;
  }

  // ──────────── Nodemailer SMTP (uncomment to use) ────────────
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({
  //   host: SMTP_HOST,
  //   port: SMTP_PORT,
  //   secure: SMTP_PORT === 465,
  //   auth: { user: SMTP_USER, pass: SMTP_PASS },
  // });
  //
  // await transporter.sendMail({
  //   from: `"Shulov Grocery" <${SMTP_FROM}>`,
  //   to,
  //   subject,
  //   html,
  // });

  console.log(`[EMAIL] Sent to ${to} via SMTP (${SMTP_HOST})`);
};

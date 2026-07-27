/**
 * Email Provider — Gmail SMTP via Nodemailer
 *
 * Uses Gmail SMTP to send real emails. Falls back to console logging
 * if SMTP credentials are not configured.
 *
 * Setup:
 *   1. Enable 2-Step Verification on your Google Account
 *   2. Generate an App Password at https://myaccount.google.com/apppasswords
 *   3. Set SMTP_USER (your Gmail) and SMTP_PASS (the App Password) in .env
 *
 * Environment variables:
 *   SMTP_HOST - SMTP server (default: smtp.gmail.com)
 *   SMTP_PORT - SMTP port (default: 587)
 *   SMTP_USER - Your Gmail address (e.g., yourname@gmail.com)
 *   SMTP_PASS - Gmail App Password (16-char code, NOT your Gmail password)
 *   SMTP_FROM - Sender display address (default: SMTP_USER value)
 */

import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'noreply@shulov.com';

// Create reusable transporter (only if credentials exist)
let transporter: nodemailer.Transporter | null = null;

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for 587 (STARTTLS)
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  // Verify connection on startup
  transporter.verify()
    .then(() => console.log('✅ [EMAIL] Gmail SMTP connected successfully — ready to send emails'))
    .catch((err) => console.error('❌ [EMAIL] Gmail SMTP connection failed:', err.message));
} else {
  console.log('ℹ️  [EMAIL] No SMTP credentials configured — emails will be logged to console');
}

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  if (!transporter) {
    // ──────────── Console Logger (No credentials configured) ────────────
    console.log('');
    console.log('┌──────────────────────────────────────────────────');
    console.log('│ [EMAIL] Order Confirmation (Console Mode)');
    console.log('│ To:      ' + to);
    console.log('│ From:    ' + SMTP_FROM);
    console.log('│ Subject: ' + subject);
    console.log('│ Body:    (Rich HTML — ' + html.length + ' chars)');
    console.log('└──────────────────────────────────────────────────');
    console.log('');
    return;
  }

  // ──────────── Send real email via Gmail SMTP ────────────
  const info = await transporter.sendMail({
    from: `"Shulov Grocery" <${SMTP_FROM}>`,
    to,
    subject,
    html,
  });

  console.log(`✅ [EMAIL] Sent to ${to} — Message ID: ${info.messageId}`);
};

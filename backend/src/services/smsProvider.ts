/**
 * Pluggable SMS Provider
 *
 * Default implementation: Console logging.
 * To integrate a real provider (Twilio, BulkSMSBD, SSL Wireless),
 * replace the sendSms function body with your provider SDK calls.
 *
 * Environment variables (read from .env):
 *   SMS_PROVIDER  - Provider name (default: "console")
 *   SMS_API_KEY   - API key for the SMS gateway
 *   SMS_SENDER_ID - Sender ID / short-code shown to recipients
 */

const SMS_PROVIDER = process.env.SMS_PROVIDER || 'console';
const SMS_API_KEY = process.env.SMS_API_KEY || '';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || 'Shulov';

export const sendSms = async (to: string, message: string): Promise<void> => {
  if (SMS_PROVIDER === 'console' || !SMS_API_KEY) {
    // ──────────── Console Logger (Default) ────────────
    console.log('');
    console.log('┌──────────────────────────────────────────────────');
    console.log('│ [SMS] Order Confirmation');
    console.log('│ To:      ' + to);
    console.log('│ Sender:  ' + SMS_SENDER_ID);
    console.log('│ Message: ' + message);
    console.log('└──────────────────────────────────────────────────');
    console.log('');
    return;
  }

  // ──────────── Twilio Example (uncomment to use) ────────────
  // const twilio = require('twilio');
  // const client = twilio(SMS_API_KEY, process.env.SMS_API_SECRET);
  // await client.messages.create({
  //   body: message,
  //   from: SMS_SENDER_ID,
  //   to: to,
  // });

  // ──────────── BulkSMSBD / Generic HTTP API Example ────────────
  // const fetch = require('node-fetch');
  // await fetch('https://api.bulksmsbd.com/api/send', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     api_key: SMS_API_KEY,
  //     sender_id: SMS_SENDER_ID,
  //     number: to,
  //     message: message,
  //   }),
  // });

  console.log(`[SMS] Sent to ${to} via ${SMS_PROVIDER}`);
};

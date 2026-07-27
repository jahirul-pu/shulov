/**
 * Notification Service — Order Confirmation Orchestrator
 *
 * Sends SMS and/or email order confirmations asynchronously.
 * Checks notification settings to decide which channels to use.
 * Never throws — failures are logged and swallowed.
 */

import { sendSms } from './smsProvider';
import { sendEmail } from './emailProvider';
import { buildOrderConfirmationEmail, buildOrderConfirmationSms } from './emailTemplates';
import { getNotificationSettings } from '../routes/settings.routes';

interface OrderUser {
  name?: string;
  email?: string;
  phone?: string;
}

interface OrderItem {
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderWithDetails {
  id: string;
  orderNumber: string;
  totalAmount: number;
  discountAmount: number;
  deliveryFee: number;
  tax: number;
  netAmount: number;
  deliveryAddress: string;
  deliverySlot: string;
  paymentMethod: string;
  createdAt: Date | string;
  items: OrderItem[];
  user?: OrderUser;
}

/**
 * Send order confirmation notifications (SMS + Email).
 * Call this WITHOUT await — fire-and-forget so the order API stays fast.
 *
 * @param order      - The created order with items and user included.
 * @param guestPhone - Phone from the checkout form (for guest users who may not have a user record phone).
 * @param guestEmail - Email from the checkout form (for guest users).
 */
export const sendOrderConfirmation = async (
  order: OrderWithDetails,
  guestPhone?: string,
  guestEmail?: string
): Promise<void> => {
  try {
    const settings = getNotificationSettings();
    const customerName = order.user?.name || 'Valued Customer';
    const customerPhone = order.user?.phone || guestPhone || '';
    const customerEmail = order.user?.email || guestEmail || '';

    // Skip generated placeholder emails (phone-only registrations)
    const isRealEmail = customerEmail && !customerEmail.endsWith('@shulov.user');

    console.log(`[NOTIFICATION] Processing order ${order.orderNumber} — SMS: ${settings.smsEnabled ? 'ON' : 'OFF'}, Email: ${settings.emailEnabled ? 'ON' : 'OFF'}`);

    // ── SMS Notification ──
    if (settings.smsEnabled && customerPhone) {
      try {
        const smsMessage = buildOrderConfirmationSms({
          orderNumber: order.orderNumber,
          netAmount: order.netAmount,
          customerName,
        });
        await sendSms(customerPhone, smsMessage);
        console.log(`[NOTIFICATION] SMS sent for order ${order.orderNumber} to ${customerPhone}`);
      } catch (smsError) {
        console.error(`[NOTIFICATION] SMS failed for order ${order.orderNumber}:`, smsError);
      }
    }

    // ── Email Notification ──
    if (settings.emailEnabled && isRealEmail) {
      try {
        const htmlBody = buildOrderConfirmationEmail({
          orderNumber: order.orderNumber,
          customerName,
          items: order.items,
          totalAmount: order.totalAmount,
          discountAmount: order.discountAmount,
          deliveryFee: order.deliveryFee,
          tax: order.tax,
          netAmount: order.netAmount,
          deliveryAddress: order.deliveryAddress,
          deliverySlot: order.deliverySlot,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
        });

        await sendEmail(
          customerEmail,
          `Order Confirmed — ${order.orderNumber} | Shulov Grocery`,
          htmlBody
        );
        console.log(`[NOTIFICATION] Email sent for order ${order.orderNumber} to ${customerEmail}`);
      } catch (emailError) {
        console.error(`[NOTIFICATION] Email failed for order ${order.orderNumber}:`, emailError);
      }
    }

    if (!customerPhone && !isRealEmail) {
      console.log(`[NOTIFICATION] No contact info available for order ${order.orderNumber} — skipping notifications.`);
    }
  } catch (error) {
    console.error(`[NOTIFICATION] Unexpected error for order ${order.orderNumber}:`, error);
  }
};

/**
 * HTML Email Templates for Order Notifications
 *
 * Shulov-branded, responsive email template for order confirmations.
 */

interface OrderItem {
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderData {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  deliveryFee: number;
  tax: number;
  netAmount: number;
  deliveryAddress: string;
  deliverySlot: string;
  paymentMethod: string;
  createdAt: string | Date;
}

export const buildOrderConfirmationEmail = (order: OrderData): string => {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">
          <strong>${item.productName}</strong>
          <br/>
          <span style="font-size: 12px; color: #94a3b8;">${item.variantName}</span>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 14px; color: #475569;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 14px; color: #475569;">
          ৳${item.unitPrice.toFixed(2)}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 14px; font-weight: 700; color: #1e293b;">
          ৳${item.totalPrice.toFixed(2)}
        </td>
      </tr>`
    )
    .join('');

  const paymentLabel =
    order.paymentMethod === 'COD'
      ? 'Cash on Delivery'
      : order.paymentMethod === 'CARD'
      ? 'Card Payment'
      : order.paymentMethod || 'Cash on Delivery';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation - ${order.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #059669 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                🛒 Shulov
              </h1>
              <p style="margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 600;">
                Fresh Groceries Delivered to Your Doorstep
              </p>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="padding: 32px 40px 16px; text-align: center;">
              <div style="display: inline-block; background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 16px 28px;">
                <p style="margin: 0; font-size: 20px; font-weight: 800; color: #16a34a;">
                  ✅ Order Confirmed!
                </p>
                <p style="margin: 6px 0 0; font-size: 13px; color: #64748b;">
                  Thank you, <strong style="color: #1e293b;">${order.customerName}</strong>! Your order has been placed successfully.
                </p>
              </div>
            </td>
          </tr>

          <!-- Order Info -->
          <tr>
            <td style="padding: 16px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #f8fafc; border-radius: 12px; padding: 16px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 12px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</td>
                        <td style="text-align: right; font-size: 15px; font-weight: 800; color: #1e293b; font-family: monospace;">${order.orderNumber}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #94a3b8; font-weight: 700; padding-top: 8px;">Order Date</td>
                        <td style="text-align: right; font-size: 13px; color: #475569; padding-top: 8px;">${orderDate}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #94a3b8; font-weight: 700; padding-top: 8px;">Payment</td>
                        <td style="text-align: right; font-size: 13px; color: #475569; padding-top: 8px;">${paymentLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 16px 40px;">
              <h3 style="margin: 0 0 12px; font-size: 15px; font-weight: 800; color: #1e293b;">
                📦 Order Items
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f8fafc;">
                    <th style="padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
                    <th style="padding: 10px 16px; text-align: center; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Qty</th>
                    <th style="padding: 10px 16px; text-align: right; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Price</th>
                    <th style="padding: 10px 16px; text-align: right; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding: 16px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; padding: 4px;">
                <tr>
                  <td style="padding: 10px 20px; font-size: 13px; color: #64748b;">Subtotal</td>
                  <td style="padding: 10px 20px; text-align: right; font-size: 13px; color: #475569;">৳${order.totalAmount.toFixed(2)}</td>
                </tr>
                ${
                  order.discountAmount > 0
                    ? `<tr>
                  <td style="padding: 4px 20px 10px; font-size: 13px; color: #16a34a;">Discount</td>
                  <td style="padding: 4px 20px 10px; text-align: right; font-size: 13px; color: #16a34a; font-weight: 700;">-৳${order.discountAmount.toFixed(2)}</td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 4px 20px 10px; font-size: 13px; color: #64748b;">Delivery Fee</td>
                  <td style="padding: 4px 20px 10px; text-align: right; font-size: 13px; color: #475569;">৳${order.deliveryFee.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 16px; font-weight: 800; color: #1e293b; border-top: 2px solid #e2e8f0;">Total</td>
                  <td style="padding: 12px 20px; text-align: right; font-size: 18px; font-weight: 800; color: #16a34a; border-top: 2px solid #e2e8f0;">৳${order.netAmount.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Details -->
          <tr>
            <td style="padding: 16px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.5px;">
                      🚚 Delivery Details
                    </p>
                    <p style="margin: 0 0 4px; font-size: 14px; color: #1e293b; font-weight: 600;">
                      ${order.deliveryAddress}
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #64748b;">
                      Delivery Slot: <strong>${order.deliverySlot}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #64748b;">
                Need help? Reply to this email or call us at <strong style="color: #1e293b;">+880 1XXX-XXXXXX</strong>
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                © ${new Date().getFullYear()} Shulov Grocery. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const buildOrderConfirmationSms = (order: {
  orderNumber: string;
  netAmount: number;
  customerName: string;
}): string => {
  return `Shulov: Hi ${order.customerName}! Your order ${order.orderNumber} for ৳${order.netAmount.toFixed(
    2
  )} has been confirmed. Thank you for shopping with Shulov! 🛒`;
};

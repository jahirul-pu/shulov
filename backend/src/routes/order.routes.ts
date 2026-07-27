import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getStoredDeliverySettings } from './settings.routes';

const router = Router();

// Validate Coupon
router.post('/validate-coupon', async (req, res) => {
  try {
    const { code, cartSubtotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code required' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive || new Date() > coupon.validUntil) {
      return res.status(400).json({ message: 'Invalid or expired coupon code' });
    }

    if (cartSubtotal && cartSubtotal < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value for ${coupon.code} is $${coupon.minOrderValue}`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (cartSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return res.json({
      valid: true,
      code: coupon.code,
      discountAmount: Math.round(discountAmount * 100) / 100,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to validate coupon' });
  }
});

// Create Order (Supports authenticated users & guest checkouts)
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { items, customerName, customerPhone, customerEmail, deliveryAddress, deliverySlot, paymentMethod, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    // Determine target user ID (from Auth token, req.body.userId, or lookup/create user)
    let targetUserId = req.body.userId || '';

    if (targetUserId) {
      const existingUser = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!existingUser) {
        targetUserId = '';
      }
    }

    if (!targetUserId) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        try {
          const JWT_SECRET = process.env.JWT_SECRET || 'shulov-secret-key-2026';
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          if (decoded && decoded.id) {
            const tokenUser = await prisma.user.findUnique({ where: { id: decoded.id } });
            if (tokenUser) {
              targetUserId = tokenUser.id;
            }
          }
        } catch (e) {
          // Fall through to lookup by phone/email
        }
      }
    }

    if (!targetUserId) {
      const rawPhone = customerPhone ? customerPhone.trim() : '';
      const rawEmail = customerEmail ? customerEmail.trim().toLowerCase() : '';

      const cleanPhoneDigits = rawPhone.replace(/\D/g, '').replace(/^880/, '0');

      let user = null;
      if (rawEmail) {
        user = await prisma.user.findUnique({ where: { email: rawEmail } });
      }

      if (!user && cleanPhoneDigits) {
        const allUsers = await prisma.user.findMany({ select: { id: true, phone: true } });
        user = allUsers.find((u) => {
          if (!u.phone) return false;
          const uClean = u.phone.replace(/\D/g, '').replace(/^880/, '0');
          return uClean === cleanPhoneDigits;
        }) as any;

        if (user) {
          user = await prisma.user.findUnique({ where: { id: user.id } });
        }
      }

      if (!user) {
        const bcrypt = require('bcryptjs');
        const userEmail = rawEmail || `${cleanPhoneDigits || Date.now()}@shulov.user`;
        const userPassword = await bcrypt.hash('user123', 10);
        user = await prisma.user.create({
          data: {
            name: customerName || 'Grocery Customer',
            email: userEmail,
            phone: rawPhone || '',
            password: userPassword,
            address: deliveryAddress || '',
            role: 'CUSTOMER',
          },
        });
      }
      targetUserId = user.id;
    }

    let totalAmount = 0;
    const orderItemData = [];

    // Any available fallback variant in DB if specific variant ID not found
    const defaultVariant = await prisma.productVariant.findFirst({ include: { product: true } });

    for (const item of items) {
      let variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant) {
        variant = defaultVariant;
      }

      if (!variant) {
        return res.status(400).json({ message: 'No product variants found in database to attach to order.' });
      }

      const quantity = Math.max(1, parseInt(item.quantity || 1, 10));
      const itemTotal = Math.round(variant.price * quantity * 100) / 100;
      totalAmount += itemTotal;

      const unitCost = variant.costPrice > 0 ? variant.costPrice : Math.round(variant.price * 0.70 * 100) / 100;

      orderItemData.push({
        variantId: variant.id,
        productName: variant.product ? variant.product.name : 'Fresh Produce Item',
        variantName: `${variant.weight} (${variant.unit})`,
        unitPrice: variant.price,
        costPrice: unitCost,
        quantity: quantity,
        totalPrice: itemTotal,
      });

      // Auto-decrement variant stock
      try {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            stock: Math.max(0, variant.stock - quantity),
          },
        });
      } catch (stockErr) {
        console.error('Failed to update stock:', stockErr);
      }
    }

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.isActive) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (totalAmount * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }

    const { deliveryZone, deliveryFee: reqDeliveryFee } = req.body;
    const settings = getStoredDeliverySettings();
    const deliveryFee = reqDeliveryFee !== undefined ? parseFloat(reqDeliveryFee) : (deliveryZone === 'OUTSIDE_DHAKA' ? settings.outsideDhaka : settings.insideDhaka);
    const tax = 0;
    const netAmount = Math.round((totalAmount - discountAmount + deliveryFee) * 100) / 100;

    const orderNumber = `SHL-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: targetUserId,
        totalAmount,
        discountAmount,
        deliveryFee,
        tax,
        netAmount,
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: paymentMethod === 'CARD' ? 'PAID' : 'UNPAID',
        deliveryAddress,
        deliverySlot: deliverySlot || 'Today, 4:00 PM - 6:00 PM',
        items: {
          create: orderItemData,
        },
      },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    // Emit live socket event if io available
    const io = req.app.get('io');
    if (io) {
      io.emit('new-order', order);
    }

    return res.status(201).json({ order });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Failed to place order' });
  }
});

// Get User's Orders
router.get('/my-orders', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch order history' });
  }
});

// Get Order Details / Live Tracking
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        user: { select: { name: true, phone: true, email: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch order' });
  }
});

export default router;

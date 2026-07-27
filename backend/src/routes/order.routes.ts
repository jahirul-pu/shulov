import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

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

// Create Order
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { items, deliveryAddress, deliverySlot, paymentMethod, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    let totalAmount = 0;
    const orderItemData = [];

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant) {
        return res.status(400).json({ message: `Variant ${item.variantId} not found` });
      }

      const itemTotal = variant.price * item.quantity;
      totalAmount += itemTotal;

      orderItemData.push({
        variantId: variant.id,
        productName: variant.product.name,
        variantName: `${variant.weight} (${variant.unit})`,
        unitPrice: variant.price,
        quantity: item.quantity,
        totalPrice: itemTotal,
      });
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

    const deliveryFee = totalAmount >= 35 ? 0 : 2.99;
    const tax = Math.round(totalAmount * 0.05 * 100) / 100;
    const netAmount = Math.round((totalAmount - discountAmount + deliveryFee + tax) * 100) / 100;

    const orderNumber = `SHL-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user!.id,
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

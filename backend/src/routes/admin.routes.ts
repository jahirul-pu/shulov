import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Dashboard Analytics KPIs, Profit & Loss, Stock & Financial Charts
router.get('/analytics', async (req, res) => {
  try {
    const { range } = req.query;
    let startDate: Date | undefined;
    const now = new Date();

    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {};

    // Fetch Orders in range
    const orders = await prisma.order.findMany({
      where: dateFilter,
      include: {
        items: true,
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch Inventory & Variants
    const allVariants = await prisma.productVariant.findMany({
      include: { product: true },
    });

    // Compute Financial Metrics
    let productSalesRevenue = 0;
    let totalCogs = 0;
    let totalDeliveryFeesCollected = 0;

    const productProfitMap: { [key: string]: { name: string; revenue: number; cogs: number; unitsSold: number } } = {};

    for (const ord of orders) {
      totalDeliveryFeesCollected += ord.deliveryFee || 0;
      for (const item of ord.items) {
        const itemRevenue = item.totalPrice || item.unitPrice * item.quantity;
        const itemCost = (item.costPrice > 0 ? item.costPrice : item.unitPrice * 0.70) * item.quantity;

        productSalesRevenue += itemRevenue;
        totalCogs += itemCost;

        const pName = item.productName || 'Grocery Item';
        if (!productProfitMap[pName]) {
          productProfitMap[pName] = { name: pName, revenue: 0, cogs: 0, unitsSold: 0 };
        }
        productProfitMap[pName].revenue += itemRevenue;
        productProfitMap[pName].cogs += itemCost;
        productProfitMap[pName].unitsSold += item.quantity;
      }
    }

    // Customer handles delivery costs, so Net Profit = Product Sales Revenue - Total COGS
    const netProfit = productSalesRevenue - totalCogs;
    const profitMargin = productSalesRevenue > 0 ? (netProfit / productSalesRevenue) * 100 : 0;

    // Inventory Valuation & Low Stock
    let inventoryValuation = 0;
    const lowStockItems: any[] = [];

    for (const v of allVariants) {
      const vCost = v.costPrice > 0 ? v.costPrice : v.price * 0.70;
      inventoryValuation += v.stock * vCost;

      if (v.stock <= 10) {
        lowStockItems.push({
          id: v.id,
          productId: v.productId,
          productName: v.product?.name || 'Grocery Item',
          weight: v.weight,
          stock: v.stock,
          price: v.price,
          costPrice: vCost,
        });
      }
    }

    // Top Profitable Products
    const topProfitableProducts = Object.values(productProfitMap)
      .map((p) => {
        const profit = p.revenue - p.cogs;
        const margin = p.revenue > 0 ? (profit / p.revenue) * 100 : 0;
        return {
          name: p.name,
          unitsSold: p.unitsSold,
          revenue: Math.round(p.revenue * 100) / 100,
          cogs: Math.round(p.cogs * 100) / 100,
          netProfit: Math.round(profit * 100) / 100,
          profitMargin: Math.round(margin * 10) / 10,
        };
      })
      .sort((a, b) => b.netProfit - a.netProfit)
      .slice(0, 5);

    // General Stats
    const totalOrdersCount = orders.length;
    const totalProducts = await prisma.product.count();
    const totalUsers = await prisma.user.count();
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });

    // Financial Trend Chart Data
    const financialTrends = [
      { label: 'Jan', revenue: 4200, cogs: 2940, profit: 1260 },
      { label: 'Feb', revenue: 5800, cogs: 4060, profit: 1740 },
      { label: 'Mar', revenue: 7300, cogs: 5110, profit: 2190 },
      { label: 'Apr', revenue: 6900, cogs: 4830, profit: 2070 },
      { label: 'May', revenue: 9100, cogs: 6370, profit: 2730 },
      { label: 'Jun', revenue: 11400, cogs: 7980, profit: 3420 },
      {
        label: range === 'today' ? 'Today' : range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'Jul',
        revenue: Math.round(productSalesRevenue * 100) / 100,
        cogs: Math.round(totalCogs * 100) / 100,
        profit: Math.round(netProfit * 100) / 100,
      },
    ];

    return res.json({
      range: range || 'all',
      kpi: {
        totalRevenue: Math.round(productSalesRevenue * 100) / 100,
        totalCogs: Math.round(totalCogs * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 10) / 10,
        inventoryValuation: Math.round(inventoryValuation * 100) / 100,
        totalOrders: totalOrdersCount,
        totalProducts,
        pendingOrders,
        lowStockCount: lowStockItems.length,
        totalUsers,
      },
      lowStockItems,
      topProfitableProducts,
      financialTrends,
      recentUsers: await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      }),
      recentOrders: orders.slice(0, 5),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Admin Orders List & Kanban
router.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch admin orders' });
  }
});

// Update Order Status (Kanban transition - PATCH & PUT)
const updateOrderStatusHandler = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status, driverId } = req.body;

    const validStatuses = ['PENDING', 'PROCESSING', 'HANDED_TO_COURIER', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    // Support lookup by UUID id or orderNumber string
    let orderToUpdate = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
    });

    if (!orderToUpdate) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = await prisma.order.update({
      where: { id: orderToUpdate.id },
      data: {
        status,
        ...(driverId ? { driverId } : {}),
      },
      include: { items: true, user: true },
    });

    // Broadcast socket event for real-time tracking update
    const io = req.app.get('io');
    if (io) {
      io.emit(`order-status-${order.id}`, { status: order.status, order });
      io.emit(`order-status-${order.orderNumber}`, { status: order.status, order });
      io.emit('order-updated', order);
    }

    return res.json({ order });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Failed to update order status' });
  }
};

router.patch('/orders/:id/status', updateOrderStatusHandler);
router.put('/orders/:id/status', updateOrderStatusHandler);

// Product CRUD (Create Product with Variant)
router.post('/products', async (req, res) => {
  try {
    const { name, categoryId, subcategoryId, description, brand, origin, isOrganic, isFlashDeal, images, variants } = req.body;

    if (!name || !categoryId || !variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ message: 'Product name, category and at least 1 variant are required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId,
        subcategoryId: subcategoryId || null,
        description: description || '',
        brand: brand || 'Shulov Fresh',
        origin: origin || 'Local Farm',
        isOrganic: !!isOrganic,
        isFlashDeal: !!isFlashDeal,
        images: JSON.stringify(images || ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80']),
        variants: {
          create: variants.map((v: any, idx: number) => ({
            weight: v.weight || '1kg',
            unit: v.unit || 'kg',
            price: parseFloat(v.price),
            originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
            stock: parseInt(v.stock || '50', 10),
            sku: v.sku || `SKU-${Date.now()}-${idx}`,
          })),
        },
      },
      include: { variants: true, category: true },
    });

    return res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ message: 'Failed to create product' });
  }
});

// Update Product
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, brand, isOrganic, isFlashDeal } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(description ? { description } : {}),
        ...(brand ? { brand } : {}),
        isOrganic: !!isOrganic,
        isFlashDeal: !!isFlashDeal,
      },
      include: { variants: true },
    });

    return res.json({ product });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update product' });
  }
});

// Delete Product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete product' });
  }
});

// Get All Users & Lifetime Purchase History
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        address: true,
        createdAt: true,
        orders: {
          include: {
            items: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate lifetime purchase stats for each user
    const usersWithStats = users.map((u) => {
      const totalOrdersCount = u.orders.length;
      const lifetimeSpend = u.orders.reduce((sum, ord) => sum + (ord.netAmount || ord.totalAmount || 0), 0);
      const lastOrderDate = u.orders.length > 0 ? u.orders[0].createdAt : null;

      // Clean up internal email handles for phone-only registrants
      const displayEmail = u.email && !u.email.endsWith('@shulov.user') ? u.email : '';

      return {
        id: u.id,
        name: u.name,
        email: displayEmail,
        phone: u.phone || '',
        role: u.role,
        address: u.address || '',
        createdAt: u.createdAt,
        totalOrdersCount,
        lifetimeSpend: Math.round(lifetimeSpend * 100) / 100,
        lastOrderDate,
        orders: u.orders,
      };
    });

    return res.json({ users: usersWithStats });
  } catch (error) {
    console.error('Fetch admin users error:', error);
    return res.status(500).json({ message: 'Failed to fetch registered users' });
  }
});

// Update Registered User Details
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(email !== undefined ? { email: email.trim() } : {}),
        ...(phone !== undefined ? { phone: phone.trim() } : {}),
        ...(address !== undefined ? { address: address.trim() } : {}),
        ...(role ? { role } : {}),
      },
    });

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ message: 'Failed to update user details' });
  }
});

// GET /api/admin/coupons
router.get('/coupons', async (req, res) => {
  try {
    let coupons = await prisma.coupon.findMany({
      orderBy: { validUntil: 'desc' },
    });

    if (coupons.length === 0) {
      const now = new Date();
      const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      await prisma.coupon.createMany({
        data: [
          {
            code: 'WELCOME20',
            discountType: 'PERCENTAGE',
            discountValue: 20,
            minOrderValue: 150,
            validUntil: future,
            isActive: true,
          },
          {
            code: 'FRESH50',
            discountType: 'FLAT',
            discountValue: 50,
            minOrderValue: 250,
            validUntil: future,
            isActive: true,
          },
        ],
      });
      coupons = await prisma.coupon.findMany({ orderBy: { validUntil: 'desc' } });
    }

    return res.json({ coupons });
  } catch (error) {
    console.error('Fetch coupons error:', error);
    return res.status(500).json({ message: 'Failed to fetch coupons' });
  }
});

// POST /api/admin/coupons
router.post('/coupons', async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, validUntil, isActive } = req.body;

    if (!code || !discountValue || !validUntil) {
      return res.status(400).json({ message: 'Code, discount value, and expiration date/time are required' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        discountType: discountType || 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue || 0),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validUntil: new Date(validUntil),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return res.status(201).json({ coupon });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    return res.status(500).json({ message: 'Failed to create coupon' });
  }
});

// PUT /api/admin/coupons/:id
router.put('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountType, discountValue, minOrderValue, maxDiscount, validUntil, isActive } = req.body;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(code ? { code: code.trim().toUpperCase() } : {}),
        ...(discountType ? { discountType } : {}),
        ...(discountValue !== undefined ? { discountValue: parseFloat(discountValue) } : {}),
        ...(minOrderValue !== undefined ? { minOrderValue: parseFloat(minOrderValue) } : {}),
        ...(maxDiscount !== undefined ? { maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null } : {}),
        ...(validUntil ? { validUntil: new Date(validUntil) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return res.json({ coupon });
  } catch (error) {
    console.error('Update coupon error:', error);
    return res.status(500).json({ message: 'Failed to update coupon' });
  }
});

// DELETE /api/admin/coupons/:id
router.delete('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    return res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return res.status(500).json({ message: 'Failed to delete coupon' });
  }
});

export default router;

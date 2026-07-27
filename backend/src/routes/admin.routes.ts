import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Dashboard Analytics KPIs & Charts Data
router.get('/analytics', async (req, res) => {
  try {
    const [totalOrders, totalRevenueData, totalProducts, pendingOrders, lowStockVariants, totalUsers] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { netAmount: true },
      }),
      prisma.product.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.productVariant.count({ where: { stock: { lte: 10 } } }),
      prisma.user.count(),
    ]);

    const totalRevenue = totalRevenueData._sum.netAmount || 0;

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true, phone: true } } },
    });

    // Monthly revenue mock/group
    const monthlyRevenue = [
      { month: 'Jan', revenue: 4200, orders: 120 },
      { month: 'Feb', revenue: 5800, orders: 160 },
      { month: 'Mar', revenue: 7300, orders: 210 },
      { month: 'Apr', revenue: 6900, orders: 190 },
      { month: 'May', revenue: 9100, orders: 280 },
      { month: 'Jun', revenue: 11400, orders: 340 },
      { month: 'Jul', revenue: totalRevenue > 0 ? totalRevenue : 14200, orders: totalOrders > 0 ? totalOrders : 410 },
    ];

    const categoryDistribution = [
      { name: 'Fresh Produce', percentage: 40 },
      { name: 'Dairy & Eggs', percentage: 25 },
      { name: 'Meat & Seafood', percentage: 15 },
      { name: 'Bakery & Snacks', percentage: 12 },
      { name: 'Pantry & Beverages', percentage: 8 },
    ];

    return res.json({
      kpi: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalProducts,
        pendingOrders,
        lowStockCount: lowStockVariants,
        totalUsers,
      },
      monthlyRevenue,
      categoryDistribution,
      recentUsers,
      recentOrders,
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

// Update Order Status (Kanban transition)
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, driverId } = req.body;

    const validStatuses = ['PENDING', 'PROCESSING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await prisma.order.update({
      where: { id },
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
      io.emit('order-updated', order);
    }

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update order status' });
  }
});

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

export default router;

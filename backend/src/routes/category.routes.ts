import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

// Get All Categories & Subcategories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true,
        _count: { select: { products: true } },
      },
    });

    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Get Homepage Banners & Coupons
router.get('/banners', async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({ where: { isActive: true } });
    const coupons = await prisma.coupon.findMany({ where: { isActive: true } });
    return res.json({ banners, coupons });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch banners' });
  }
});

// In-memory MegaMenu Config Store
let megamenuConfig = [
  {
    id: 'cat-1',
    name: 'Fresh Fruits & Veggies',
    slug: 'fresh-produce',
    badge: '100% Organic',
    isActive: true,
    subcategories: [
      { id: 'sub-1', name: 'Fresh Fruits' },
      { id: 'sub-2', name: 'Fresh Vegetables' },
      { id: 'sub-3', name: 'Organic Salad Greens' },
      { id: 'sub-4', name: 'Exotic & Seasonal Produce' },
    ],
  },
  {
    id: 'cat-2',
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    badge: 'Farm Fresh',
    isActive: true,
    subcategories: [
      { id: 'sub-5', name: 'Whole Pasteurized Milk' },
      { id: 'sub-6', name: 'Free Range Farm Eggs' },
      { id: 'sub-7', name: 'Artisan Butter & Cheese' },
      { id: 'sub-8', name: 'Fresh Yogurt & Laban' },
    ],
  },
  {
    id: 'cat-3',
    name: 'Bakery & Snacks',
    slug: 'bakery-snacks',
    badge: 'Baked Daily',
    isActive: true,
    subcategories: [
      { id: 'sub-9', name: 'Artisan Whole Grain Breads' },
      { id: 'sub-10', name: 'Warm Croissants & Pastries' },
      { id: 'sub-11', name: 'Cookies & Gourmet Biscuits' },
      { id: 'sub-12', name: 'Roasted Nuts & Chips' },
    ],
  },
  {
    id: 'cat-4',
    name: 'Meat & Seafood',
    slug: 'meat-seafood',
    badge: '100% Halal',
    isActive: true,
    subcategories: [
      { id: 'sub-13', name: 'Skinless Fresh Chicken' },
      { id: 'sub-14', name: 'Prime Beef & Mutton Cuts' },
      { id: 'sub-15', name: 'Fresh Ocean & River Fish' },
      { id: 'sub-16', name: 'Jumbo Prawns & Seafood' },
    ],
  },
  {
    id: 'cat-5',
    name: 'Beverages & Juices',
    slug: 'beverages',
    badge: 'Cold Pressed',
    isActive: true,
    subcategories: [
      { id: 'sub-17', name: 'Cold-Pressed Detox Juices' },
      { id: 'sub-18', name: 'Organic Green & Black Tea' },
      { id: 'sub-19', name: 'Roasted Coffee Beans' },
      { id: 'sub-20', name: 'Sparkling Mineral Water' },
    ],
  },
  {
    id: 'cat-6',
    name: 'Pantry & Oils',
    slug: 'pantry-oil',
    badge: 'Pure Quality',
    isActive: true,
    subcategories: [
      { id: 'sub-21', name: 'Kalizira & Basmati Rice' },
      { id: 'sub-22', name: 'Cold-Pressed Mustard Oil' },
      { id: 'sub-23', name: 'Organic Whole Spices' },
      { id: 'sub-24', name: 'Pulses & Lentils (Dal)' },
    ],
  },
];

// Get MegaMenu Config
router.get('/megamenu', (req, res) => {
  return res.json({ categories: megamenuConfig });
});

// Update MegaMenu Config
router.put('/megamenu', (req, res) => {
  const { categories } = req.body;
  if (Array.isArray(categories)) {
    megamenuConfig = categories;
  }
  return res.json({ message: 'MegaMenu configuration updated', categories: megamenuConfig });
});

export default router;

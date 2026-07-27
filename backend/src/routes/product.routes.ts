import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get Products (with Search & Category Filtering)
router.get('/', (req, res) => {
  try {
    const { search, category, isOrganic, isFlashDeal } = req.query;

    let filtered = customProductsCatalog.filter((p) => !p.isHidden);

    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (category) {
      const catSlug = (category as string).toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.category?.slug === catSlug ||
          p.category?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === catSlug
      );
    }

    if (isOrganic === 'true') {
      filtered = filtered.filter((p) => p.isOrganic);
    }

    if (isFlashDeal === 'true') {
      filtered = filtered.filter((p) => p.isFlashDeal);
    }

    return res.json({ products: filtered, pagination: { total: filtered.length, page: 1, totalPages: 1 } });
  } catch (error) {
    return res.json({ products: customProductsCatalog.filter((p) => !p.isHidden) });
  }
});

// Get Single Product by Slug or ID
router.get('/:identifier', (req, res) => {
  try {
    const { identifier } = req.params;

    const product = customProductsCatalog.find(
      (p) => p.id === identifier || p.slug === identifier
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ product });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch product details' });
  }
});

// Add Review for Product
router.post('/:id/reviews', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    const review = await prisma.review.create({
      data: {
        productId: id,
        userId: req.user!.id,
        userName: req.user!.name,
        rating: parseInt(rating, 10),
        comment,
      },
    });

    // Recalculate average rating
    const reviews = await prisma.review.findMany({ where: { productId: id } });
    const avgRating = reviews.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0) / reviews.length;

    await prisma.product.update({
      where: { id },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      },
    });

    return res.status(201).json({ review });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit review' });
  }
});

// Memory Store fallback catalog with full grocery items
let customProductsCatalog: any[] = [
  {
    id: 'cp1',
    name: 'Organic Red Crisp Apples',
    slug: 'organic-red-crisp-apples',
    description: 'Crisp red apples harvested directly from organic orchards.',
    brand: 'Orchard Fresh',
    origin: 'Kashmir Valley',
    isOrganic: true,
    isFlashDeal: true,
    isHidden: false,
    rating: 4.9,
    reviewCount: 48,
    category: { name: 'Fresh Fruits & Veggies', slug: 'fresh-produce' },
    images: JSON.stringify(['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80']),
    variants: [{ id: 'v101', weight: '1kg', price: 4.49, stock: 80, sku: 'APP-1KG' }],
  },
  {
    id: 'cp2',
    name: 'Fresh Cavendish Bananas',
    slug: 'fresh-cavendish-bananas',
    description: 'Sweet yellow Cavendish bananas ripened naturally.',
    brand: 'TropiFresh',
    origin: 'Bogura',
    isOrganic: false,
    isFlashDeal: true,
    isHidden: false,
    rating: 4.8,
    reviewCount: 32,
    category: { name: 'Fresh Fruits & Veggies', slug: 'fresh-produce' },
    images: JSON.stringify(['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80']),
    variants: [{ id: 'v103', weight: '1 Dozen', price: 1.89, stock: 120, sku: 'BAN-1DOZ' }],
  },
  {
    id: 'cp3',
    name: 'Hydroponic Baby Spinach',
    slug: 'organic-hydroponic-baby-spinach',
    description: 'Pesticide free tender baby spinach leaves.',
    brand: 'Green Leaf',
    origin: 'Dhaka Farm',
    isOrganic: true,
    isFlashDeal: false,
    isHidden: false,
    rating: 4.95,
    reviewCount: 26,
    category: { name: 'Fresh Fruits & Veggies', slug: 'fresh-produce' },
    images: JSON.stringify(['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80']),
    variants: [{ id: 'v104', weight: '250g Pack', price: 1.99, stock: 30, sku: 'SPI-250G' }],
  },
  {
    id: 'p2',
    name: 'Farm-Fresh Whole Pasteurized Milk',
    slug: 'farm-fresh-whole-milk',
    description: 'Pure pasteurized whole cow milk delivered cold.',
    brand: 'MilkyWay',
    origin: 'Pabna Dairy',
    isOrganic: true,
    isFlashDeal: true,
    isHidden: false,
    rating: 4.9,
    reviewCount: 64,
    category: { name: 'Dairy & Eggs', slug: 'dairy-eggs' },
    images: JSON.stringify(['https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80']),
    variants: [{ id: 'v201', weight: '1 Liter', price: 1.69, stock: 95, sku: 'MLK-1L' }],
  },
  {
    id: 'p3',
    name: 'Warm Artisanal Sourdough Bread',
    slug: 'warm-artisanal-sourdough-bread',
    description: 'Freshly baked naturally fermented sourdough loaf.',
    brand: 'Master Baker',
    origin: 'Local Oven',
    isOrganic: false,
    isFlashDeal: false,
    isHidden: false,
    rating: 4.85,
    reviewCount: 40,
    category: { name: 'Bakery & Snacks', slug: 'bakery-snacks' },
    images: JSON.stringify(['https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80']),
    variants: [{ id: 'v301', weight: '500g Loaf', price: 3.25, stock: 25, sku: 'BRD-500G' }],
  },
  {
    id: 'p4',
    name: 'Fresh Norwegian Atlantic Salmon Fillet',
    slug: 'fresh-norwegian-salmon-fillet',
    description: 'Premium skin-on Atlantic salmon fillet cut fresh.',
    brand: 'Ocean Catch',
    origin: 'Norway',
    isOrganic: true,
    isFlashDeal: false,
    isHidden: false,
    rating: 5.0,
    reviewCount: 19,
    category: { name: 'Meat & Seafood', slug: 'meat-seafood' },
    images: JSON.stringify(['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80']),
    variants: [{ id: 'v401', weight: '400g Fillet', price: 12.99, stock: 15, sku: 'SLM-400G' }],
  },
  {
    id: 'p5',
    name: '100% Cold-Pressed Valencia Orange Juice',
    slug: 'cold-pressed-orange-juice',
    description: 'Zero added sugar pure orange juice bottled fresh.',
    brand: 'Squeeze&Co',
    origin: 'Valencia',
    isOrganic: true,
    isFlashDeal: true,
    isHidden: false,
    rating: 4.92,
    reviewCount: 52,
    category: { name: 'Beverages', slug: 'beverages' },
    images: JSON.stringify(['https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=600&q=80']),
    variants: [{ id: 'v501', weight: '750ml Bottle', price: 4.99, stock: 50, sku: 'ORJ-750M' }],
  },
  {
    id: 'p6',
    name: 'Cold-Pressed Extra Virgin Olive Oil',
    slug: 'extra-virgin-olive-oil',
    description: 'First cold pressed extra virgin Mediterranean olive oil.',
    brand: 'Oliva',
    origin: 'Spain',
    isOrganic: true,
    isFlashDeal: false,
    isHidden: false,
    rating: 4.98,
    reviewCount: 88,
    category: { name: 'Pantry & Oil', slug: 'pantry-oil' },
    images: JSON.stringify(['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80']),
    variants: [{ id: 'v601', weight: '500ml Bottle', price: 8.50, stock: 60, sku: 'OIL-500M' }],
  },
];

// Return catalog with custom memory edits merged
router.get('/all-catalog', (req, res) => {
  return res.json({ products: customProductsCatalog });
});

// Update Product (PUT /api/products/:id)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const index = customProductsCatalog.findIndex((p) => p.id === id);
  if (index > -1) {
    customProductsCatalog[index] = {
      ...customProductsCatalog[index],
      ...updateData,
    };
    return res.json({ message: 'Product updated successfully', product: customProductsCatalog[index] });
  }

  // If not existing, push to memory catalog
  const newProduct = { id, ...updateData };
  customProductsCatalog.unshift(newProduct);
  return res.json({ message: 'Product created', product: newProduct });
});

// Create Product (POST /api/products)
router.post('/', (req, res) => {
  const newProd = { id: `p-${Date.now()}`, isHidden: false, ...req.body };
  customProductsCatalog.unshift(newProd);
  return res.status(201).json({ message: 'Product added', product: newProd });
});

// Delete Product (DELETE /api/products/:id)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  customProductsCatalog = customProductsCatalog.filter((p) => p.id !== id);
  return res.json({ message: 'Product deleted successfully' });
});

export default router;

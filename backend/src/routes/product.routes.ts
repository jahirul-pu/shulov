import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get Products (with Search & Category Filtering)
router.get('/', async (req, res) => {
  try {
    const { search, category, isOrganic, isFlashDeal } = req.query;

    const dbProducts = await prisma.product.findMany({
      include: { category: true, subcategory: true, variants: true },
      orderBy: { createdAt: 'desc' },
    });

    let filtered = dbProducts.length > 0 ? dbProducts : customProductsCatalog.filter((p) => !p.isHidden);

    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (category) {
      const catSlug = (category as string).toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.category?.slug === catSlug ||
          p.category?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === catSlug
      );
    }

    if (isOrganic === 'true') {
      filtered = filtered.filter((p: any) => p.isOrganic);
    }

    if (isFlashDeal === 'true') {
      filtered = filtered.filter((p: any) => p.isFlashDeal);
    }

    return res.json({ products: filtered, pagination: { total: filtered.length, page: 1, totalPages: 1 } });
  } catch (error) {
    return res.json({ products: customProductsCatalog.filter((p) => !p.isHidden) });
  }
});

// Return full catalog
router.get('/all-catalog', async (req, res) => {
  try {
    const dbProducts = await prisma.product.findMany({
      include: { category: true, subcategory: true, variants: true },
      orderBy: { createdAt: 'desc' },
    });

    if (dbProducts.length > 0) {
      return res.json({ products: dbProducts });
    }
    return res.json({ products: customProductsCatalog });
  } catch (e) {
    return res.json({ products: customProductsCatalog });
  }
});

// Get Single Product by Slug or ID
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    let product: any = await prisma.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: { category: true, subcategory: true, variants: true, reviews: true },
    });

    if (!product) {
      product = customProductsCatalog.find(
        (p) => p.id === identifier || p.slug === identifier
      );
    }

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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const index = customProductsCatalog.findIndex((p) => p.id === id || p.slug === id);
    if (index > -1) {
      customProductsCatalog[index] = {
        ...customProductsCatalog[index],
        ...updateData,
      };
    } else {
      customProductsCatalog.unshift({ id, ...updateData });
    }

    try {
      const dbProd = await prisma.product.findFirst({ where: { OR: [{ id }, { slug: id }] } });
      if (dbProd) {
        await prisma.product.update({
          where: { id: dbProd.id },
          data: {
            ...(updateData.name ? { name: updateData.name } : {}),
            ...(updateData.description ? { description: updateData.description } : {}),
            ...(updateData.brand ? { brand: updateData.brand } : {}),
            ...(updateData.isOrganic !== undefined ? { isOrganic: Boolean(updateData.isOrganic) } : {}),
            ...(updateData.isFlashDeal !== undefined ? { isFlashDeal: Boolean(updateData.isFlashDeal) } : {}),
          },
        });
      }
    } catch (e) {}

    return res.json({ message: 'Product updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update product' });
  }
});

// Create Product (POST /api/products)
router.post('/', async (req, res) => {
  try {
    const { name, brand, description, category, subcategory, images, isOrganic, isFlashDeal, variants } = req.body;

    const prodName = name || 'New Grocery Item';
    const prodSlug = prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
    
    // Normalize image format to JSON array string
    let formattedImagesString = JSON.stringify(['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80']);
    if (images) {
      if (Array.isArray(images)) {
        formattedImagesString = JSON.stringify(images);
      } else if (typeof images === 'string') {
        const trimmed = images.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          formattedImagesString = trimmed;
        } else {
          formattedImagesString = JSON.stringify([trimmed]);
        }
      }
    }

    // Category resolution
    let catRecord = await prisma.category.findFirst({
      where: {
        OR: [
          { name: category?.name || (typeof category === 'string' ? category : 'Fresh Fruits & Veggies') },
          { slug: category?.slug || 'fresh-produce' },
        ],
      },
    });

    if (!catRecord) {
      catRecord = await prisma.category.findFirst();
    }

    const createdProduct = await prisma.product.create({
      data: {
        name: prodName,
        slug: prodSlug,
        description: description || 'Fresh high quality grocery product.',
        brand: brand || 'Shulov Fresh',
        origin: 'Bangladesh',
        images: formattedImagesString,
        isOrganic: Boolean(isOrganic),
        isFlashDeal: Boolean(isFlashDeal),
        categoryId: catRecord ? catRecord.id : 'cat-1',
        variants: {
          create: Array.isArray(variants) && variants.length > 0
            ? variants.map((v: any) => ({
                weight: v.weight || '1kg',
                unit: 'kg',
                price: parseFloat(v.price) || 2.5,
                costPrice: parseFloat(v.costPrice) || Math.round((parseFloat(v.price) || 2.5) * 0.70 * 100) / 100,
                stock: parseInt(v.stock, 10) || 50,
                sku: v.sku || `SKU-${Date.now().toString().slice(-4)}`,
              }))
            : [{ weight: '1kg', unit: 'kg', price: 3.5, costPrice: 2.45, stock: 50, sku: `SKU-${Date.now().toString().slice(-4)}` }],
        },
      },
      include: { category: true, subcategory: true, variants: true },
    });

    customProductsCatalog.unshift(createdProduct);
    return res.status(201).json({ message: 'Product added successfully', product: createdProduct });
  } catch (e) {
    console.error('Create product DB error:', e);
    const newProd = { id: `p-${Date.now()}`, isHidden: false, ...req.body };
    customProductsCatalog.unshift(newProd);
    return res.status(201).json({ message: 'Product added', product: newProd });
  }
});

// Delete Product (DELETE /api/products/:id)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find target product in memory catalog or database
    const targetMemProd = customProductsCatalog.find(
      (p) => p.id === id || p.slug === id || (p.name && p.name.toLowerCase().includes(id.toLowerCase()))
    );

    const dbProds = await prisma.product.findMany({
      where: {
        OR: [
          { id },
          { slug: id },
          ...(targetMemProd ? [{ name: targetMemProd.name }, { slug: targetMemProd.slug }] : []),
        ],
      },
    });

    const targetNames = [
      ...(targetMemProd ? [targetMemProd.name.toLowerCase()] : []),
      ...dbProds.map((p) => p.name.toLowerCase()),
    ];

    const targetIds = [id, ...(targetMemProd ? [targetMemProd.id] : []), ...dbProds.map((p) => p.id)];
    const targetSlugs = [id, ...(targetMemProd ? [targetMemProd.slug] : []), ...dbProds.map((p) => p.slug)];

    // Remove from memory catalog
    customProductsCatalog = customProductsCatalog.filter((p) => {
      const pName = p.name ? p.name.toLowerCase() : '';
      return (
        !targetIds.includes(p.id) &&
        !targetSlugs.includes(p.slug) &&
        !targetNames.includes(pName)
      );
    });

    // Delete order items, reviews, variants and product from SQLite database cleanly
    for (const dbP of dbProds) {
      try {
        const variants = await prisma.productVariant.findMany({ where: { productId: dbP.id } });
        for (const v of variants) {
          await prisma.orderItem.deleteMany({ where: { variantId: v.id } });
        }
        await prisma.review.deleteMany({ where: { productId: dbP.id } });
        await prisma.productVariant.deleteMany({ where: { productId: dbP.id } });
        await prisma.product.delete({ where: { id: dbP.id } });
      } catch (dbErr) {
        console.error('Error deleting product from DB:', dbErr);
      }
    }

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Shulov Admin',
      email: 'admin@shulov.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+880 1700-000000',
      address: 'Central Store Hub, Dhaka',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Rahim Chowdhury',
      email: 'rahim@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '+880 1812-345678',
      address: 'House 42, Road 11, Banani, Dhaka',
    },
  });

  console.log('✅ Users created:', { admin: admin.email, customer: customer.email });

  // Create Categories & Subcategories
  const categoriesData = [
    {
      name: 'Fresh Fruits & Veggies',
      slug: 'fresh-produce',
      icon: 'Apple',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
      description: 'Farm-fresh organic fruits, vegetables & leafy greens picked daily.',
      subcategories: ['Fresh Fruits', 'Fresh Vegetables', 'Organic Greens', 'Exotic Produce'],
    },
    {
      name: 'Dairy & Eggs',
      slug: 'dairy-eggs',
      icon: 'Milk',
      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
      description: 'Pasteurized milk, farm eggs, artisan cheese, yogurt & butter.',
      subcategories: ['Milk & Cream', 'Eggs & Butter', 'Cheese & Yogurt', 'Dairy Alternatives'],
    },
    {
      name: 'Bakery & Snacks',
      slug: 'bakery-snacks',
      icon: 'Cookie',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      description: 'Freshly baked artisanal breads, cookies, chips & savory snacks.',
      subcategories: ['Breads & Buns', 'Cookies & Biscuits', 'Chips & Nuts', 'Cakes & Pastries'],
    },
    {
      name: 'Meat & Seafood',
      slug: 'meat-seafood',
      icon: 'Beef',
      image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
      description: 'Fresh cuts of chicken, beef, mutton & ocean-fresh seafood.',
      subcategories: ['Fresh Poultry', 'Prime Meat Cuts', 'Ocean Fish', 'Shrimp & Shellfish'],
    },
    {
      name: 'Beverages',
      slug: 'beverages',
      icon: 'CupSoda',
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
      description: 'Natural fruit juices, herbal teas, coffee beans & sparkling water.',
      subcategories: ['Fresh Juices', 'Tea & Coffee', 'Soft Drinks', 'Energy Drinks'],
    },
    {
      name: 'Pantry & Oil',
      slug: 'pantry-oil',
      icon: 'Wheat',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      description: 'Premium rice, aromatic spices, cold-pressed oils & pulses.',
      subcategories: ['Rice & Grains', 'Cooking Oils', 'Spices & Seasonings', 'Canned Foods'],
    },
  ];

  const createdCategories: any = {};

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        image: cat.image,
        description: cat.description,
        subcategories: {
          create: cat.subcategories.map((subName) => ({
            name: subName,
            slug: subName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          })),
        },
      },
      include: { subcategories: true },
    });
    createdCategories[cat.slug] = createdCat;
  }

  console.log('✅ Categories created');

  // Create Products
  const products = [
    {
      name: 'Organic Red Crisp Apples',
      slug: 'organic-red-crisp-apples',
      description: 'Hand-picked crisp red apples directly from organic mountain orchards. Rich in fiber, antioxidant vitamins, and natural sweetness.',
      brand: 'Orchard Fresh',
      origin: 'Kashmir Valley',
      isOrganic: true,
      isFlashDeal: true,
      rating: 4.9,
      reviewCount: 48,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=600&q=80',
      ]),
      categorySlug: 'fresh-produce',
      variants: [
        { weight: '500g', unit: 'g', price: 2.49, originalPrice: 3.20, stock: 45, sku: 'APP-500G' },
        { weight: '1kg', unit: 'kg', price: 4.49, originalPrice: 5.99, stock: 80, sku: 'APP-1KG' },
        { weight: '2kg Pack', unit: 'kg', price: 8.49, originalPrice: 10.99, stock: 25, sku: 'APP-2KG' },
      ],
    },
    {
      name: 'Fresh Cavendish Bananas',
      slug: 'fresh-cavendish-bananas',
      description: 'Naturally ripened, sweet and creamy yellow Cavendish bananas. Perfect daily energy boost for breakfast and smoothies.',
      brand: 'TropiFresh',
      origin: 'Bogura Farms',
      isOrganic: false,
      isFlashDeal: true,
      rating: 4.8,
      reviewCount: 32,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
      ]),
      categorySlug: 'fresh-produce',
      variants: [
        { weight: '1 Dozen (12 pcs)', unit: 'doz', price: 1.89, originalPrice: 2.40, stock: 120, sku: 'BAN-1DOZ' },
        { weight: 'Half Dozen (6 pcs)', unit: 'doz', price: 0.99, originalPrice: 1.30, stock: 90, sku: 'BAN-6PCS' },
      ],
    },
    {
      name: 'Organic Hydroponic Baby Spinach',
      slug: 'organic-hydroponic-baby-spinach',
      description: 'Pesticide-free tender baby spinach leaves cultivated in nutrient-rich hydroponic water system. Pre-washed and ready to eat.',
      brand: 'Green Leaf Co.',
      origin: 'Dhaka Green Farm',
      isOrganic: true,
      isFlashDeal: false,
      rating: 4.95,
      reviewCount: 26,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      ]),
      categorySlug: 'fresh-produce',
      variants: [
        { weight: '250g Pack', unit: 'g', price: 1.99, originalPrice: 2.50, stock: 30, sku: 'SPI-250G' },
        { weight: '500g Value Pack', unit: 'g', price: 3.49, originalPrice: 4.50, stock: 20, sku: 'SPI-500G' },
      ],
    },
    {
      name: 'Farm-Fresh Whole Pasteurized Milk',
      slug: 'farm-fresh-whole-pasteurized-milk',
      description: '100% pure cow milk homogenised and pasteurized to retain calcium, protein and creamy taste without any artificial preservatives.',
      brand: 'MilkyWay',
      origin: 'Pabna Dairy',
      isOrganic: true,
      isFlashDeal: true,
      rating: 4.85,
      reviewCount: 75,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
      ]),
      categorySlug: 'dairy-eggs',
      variants: [
        { weight: '1 Liter Bottle', unit: 'L', price: 1.69, originalPrice: 2.10, stock: 150, sku: 'MLK-1L' },
        { weight: '2 Liter Family Bottle', unit: 'L', price: 3.19, originalPrice: 4.00, stock: 60, sku: 'MLK-2L' },
      ],
    },
    {
      name: 'Omega-3 Free Range Brown Eggs',
      slug: 'omega-3-free-range-brown-eggs',
      description: 'Fresh brown eggs laid by cage-free hens fed on natural grain feed enriched with Omega-3 fatty acids & Vitamin D.',
      brand: 'Happy Hens Farm',
      origin: 'Sylhet Farm',
      isOrganic: true,
      isFlashDeal: false,
      rating: 4.9,
      reviewCount: 60,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=600&q=80',
      ]),
      categorySlug: 'dairy-eggs',
      variants: [
        { weight: '12 Eggs Pack', unit: 'pcs', price: 2.99, originalPrice: 3.75, stock: 100, sku: 'EGG-12P' },
        { weight: '30 Eggs Tray', unit: 'pcs', price: 6.99, originalPrice: 8.50, stock: 40, sku: 'EGG-30P' },
      ],
    },
    {
      name: 'Artisan Whole Wheat Sourdough Bread',
      slug: 'artisan-whole-wheat-sourdough-bread',
      description: 'Slow-fermented whole wheat sourdough loaf crafted with natural starter, sea salt and zero added sugars.',
      brand: 'Bakehouse 42',
      origin: 'In-House Bakery',
      isOrganic: true,
      isFlashDeal: false,
      rating: 4.75,
      reviewCount: 19,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
      ]),
      categorySlug: 'bakery-snacks',
      variants: [
        { weight: '400g Loaf', unit: 'g', price: 3.29, originalPrice: 4.00, stock: 25, sku: 'BRD-400G' },
      ],
    },
    {
      name: 'Skinless Fresh Chicken Breast Fillet',
      slug: 'skinless-fresh-chicken-breast-fillet',
      description: 'Lean, tender skinless chicken breast cut from antibiotic-free poultry. Cleaned, prepped and vacuum packed for ultimate hygiene.',
      brand: 'Fresh Cut Meats',
      origin: 'Gazipur Poultry',
      isOrganic: false,
      isFlashDeal: true,
      rating: 4.8,
      reviewCount: 54,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80',
      ]),
      categorySlug: 'meat-seafood',
      variants: [
        { weight: '500g Pack', unit: 'g', price: 4.99, originalPrice: 6.20, stock: 50, sku: 'CHK-500G' },
        { weight: '1kg Value Pack', unit: 'kg', price: 8.99, originalPrice: 11.50, stock: 35, sku: 'CHK-1KG' },
      ],
    },
    {
      name: 'Cold-Pressed Extra Virgin Olive Oil',
      slug: 'cold-pressed-extra-virgin-olive-oil',
      description: 'First cold-pressed unrefined olive oil bottled directly in dark glass to preserve rich polyphenol antioxidants.',
      brand: 'Mediterra',
      origin: 'Spain Import',
      isOrganic: true,
      isFlashDeal: false,
      rating: 4.92,
      reviewCount: 41,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
      ]),
      categorySlug: 'pantry-oil',
      variants: [
        { weight: '500ml Glass Bottle', unit: 'ml', price: 7.99, originalPrice: 9.99, stock: 40, sku: 'OIL-500ML' },
        { weight: '1 Liter Bottle', unit: 'L', price: 13.99, originalPrice: 17.50, stock: 20, sku: 'OIL-1L' },
      ],
    },
  ];

  for (const prod of products) {
    const category = createdCategories[prod.categorySlug];
    const subcategory = category.subcategories[0];

    const createdProd = await prisma.product.create({
      data: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        brand: prod.brand,
        origin: prod.origin,
        isOrganic: prod.isOrganic,
        isFlashDeal: prod.isFlashDeal,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        images: prod.images,
        categoryId: category.id,
        subcategoryId: subcategory ? subcategory.id : null,
        variants: {
          create: prod.variants,
        },
      },
    });

    // Add a sample review
    await prisma.review.create({
      data: {
        productId: createdProd.id,
        userId: customer.id,
        userName: customer.name,
        rating: 5,
        comment: 'Extremely fresh and delivered within 25 minutes! Packaging was top-notch.',
      },
    });
  }

  console.log('✅ Products & Variants created');

  // Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderValue: 15,
        maxDiscount: 10,
        validUntil: new Date('2027-12-31'),
        isActive: true,
      },
      {
        code: 'FRESH5',
        discountType: 'FLAT',
        discountValue: 5,
        minOrderValue: 25,
        validUntil: new Date('2027-12-31'),
        isActive: true,
      },
    ],
  });

  console.log('✅ Coupons created');

  // Create Banners
  await prisma.banner.createMany({
    data: [
      {
        title: '100% Organic Farm Produce',
        subtitle: 'Handpicked daily & delivered fresh to your door within 30 minutes.',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
        tag: 'Fresh Deals',
        link: '/category/fresh-produce',
      },
      {
        title: 'Artisan Bakery & Morning Dairy',
        subtitle: 'Start your morning with pasteurized fresh milk and crispy sourdough loafs.',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
        tag: 'Daily Breakfast',
        link: '/category/dairy-eggs',
      },
    ],
  });

  console.log('✅ Banners created');
  console.log('🚀 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

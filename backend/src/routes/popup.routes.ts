import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// PUBLIC: get all active popups (for storefront)
router.get('/', async (_req, res) => {
  try {
    const popups = await prisma.popup.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ popups });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch popups', error: err?.message });
  }
});

// ADMIN: get all popups (active + inactive)
router.get('/all', async (_req, res) => {
  try {
    const popups = await prisma.popup.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ popups });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch popups', error: err?.message });
  }
});

// ADMIN: create popup
router.post('/', async (req, res) => {
  try {
    const { image, couponCode, ctaLabel, ctaLink, isActive } = req.body;
    if (!image) return res.status(400).json({ message: 'Image is required' });

    const popup = await prisma.popup.create({
      data: {
        image,
        couponCode: couponCode || null,
        ctaLabel: ctaLabel || 'Shop Now',
        ctaLink: ctaLink || '/',
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    res.status(201).json({ popup });
  } catch (err: any) {
    console.error('[Popup POST error]', err);
    res.status(500).json({ message: err?.message || 'Failed to create popup' });
  }
});

// ADMIN: update popup
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { image, couponCode, ctaLabel, ctaLink, isActive } = req.body;

    const popup = await prisma.popup.update({
      where: { id },
      data: {
        ...(image !== undefined && { image }),
        ...(couponCode !== undefined && { couponCode: couponCode || null }),
        ...(ctaLabel !== undefined && { ctaLabel }),
        ...(ctaLink !== undefined && { ctaLink }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json({ popup });
  } catch (err: any) {
    console.error('[Popup PUT error]', err);
    res.status(500).json({ message: err?.message || 'Failed to update popup' });
  }
});

// ADMIN: delete popup
router.delete('/:id', async (req, res) => {
  try {
    await prisma.popup.delete({ where: { id: req.params.id } });
    res.json({ message: 'Popup deleted' });
  } catch (err: any) {
    console.error('[Popup DELETE error]', err);
    res.status(500).json({ message: err?.message || 'Failed to delete popup' });
  }
});

export default router;


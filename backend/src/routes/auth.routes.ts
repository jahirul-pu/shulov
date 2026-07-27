import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'shulov-secret-key-2026';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ message: 'Name, password, and either email or phone number are required' });
    }

    let userEmail = email ? email.trim().toLowerCase() : '';
    const userPhone = phone ? phone.trim() : '';

    if (!userEmail && userPhone) {
      const cleanDigits = userPhone.replace(/\D/g, '');
      userEmail = `${cleanDigits}@shulov.user`;
    }

    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: userEmail } });
      if (existingEmail) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
    }

    if (userPhone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone: userPhone } });
      if (existingPhone) {
        return res.status(400).json({ message: 'User with this phone number already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: userEmail,
        password: hashedPassword,
        phone: userPhone,
        address: address || '',
        role: 'CUSTOMER',
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, phone, identifier, password } = req.body;
    const loginId = (identifier || email || phone || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Email/Phone and password are required' });
    }

    // Try finding by email first, then by phone
    let user = await prisma.user.findUnique({ where: { email: loginId.toLowerCase() } });
    if (!user) {
      user = await prisma.user.findFirst({ where: { phone: loginId } });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Failed to log in' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, phone: true, address: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Update Profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, phone, email, address } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
        ...(address !== undefined ? { address } : {}),
      },
      select: { id: true, name: true, email: true, role: true, phone: true, address: true, createdAt: true },
    });

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Failed to update user profile' });
  }
});

export default router;

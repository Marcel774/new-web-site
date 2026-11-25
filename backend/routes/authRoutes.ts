import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { Admin } from '../models/Admin.ts';
import { AuthenticatedRequest, requireAdmin, signAdminToken } from '../middleware/auth.ts';
import { isNonEmptyString, isValidEmail } from '../utils/validation.ts';

const router = Router();

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const adminCount = await Admin.countDocuments();
    res.json({
      adminCount,
      hasAdmin: adminCount > 0,
    });
  } catch (error) {
    console.error('Auth status error:', error);
    res.status(500).json({ error: 'Unable to check administrator status.' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (!isNonEmptyString(name, 2, 80)) {
      res.status(400).json({ error: 'Full name must be between 2 and 80 characters.' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await Admin.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      res.status(409).json({ error: 'An administrator account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const createdAdmin = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'admin',
    });

    const token = signAdminToken({
      sub: String(createdAdmin._id),
      email: createdAdmin.email,
      name: createdAdmin.name,
      role: 'admin',
    });

    res.status(201).json({
      message: 'Administrator account registered successfully.',
      token,
      admin: {
        id: String(createdAdmin._id),
        name: createdAdmin.name,
        email: createdAdmin.email,
        role: createdAdmin.role,
      },
    });
  } catch (error) {
    console.error('Admin register error:', error);
    res.status(500).json({ error: 'Failed to register administrator account.' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!isValidEmail(email) || typeof password !== 'string' || password.length === 0) {
      res.status(400).json({ error: 'Valid email and password are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = await Admin.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!admin) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signAdminToken({
      sub: String(admin._id),
      email: admin.email,
      name: admin.name,
      role: 'admin',
    });

    res.json({
      message: 'Signed in successfully.',
      token,
      admin: {
        id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Unable to complete sign-in.' });
  }
});

router.get('/me', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({ admin: req.admin });
});

export default router;

import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.ts';

const IN_MEMORY_JWT_FALLBACK = crypto.randomBytes(32).toString('hex');

function getJwtSecret(): string {
  const envSecret = process.env.JWT_SECRET?.trim();
  return envSecret && envSecret.length >= 16 ? envSecret : IN_MEMORY_JWT_FALLBACK;
}

export interface AdminTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: 'admin';
}

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    name: string;
    email: string;
    role: 'admin';
  };
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: '12h',
    issuer: 'movieflix-api',
  });
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please sign in as an administrator.' });
      return;
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      res.status(401).json({ error: 'Invalid authentication token.' });
      return;
    }

    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: 'movieflix-api',
    }) as AdminTokenPayload;

    if (!decoded || typeof decoded.sub !== 'string' || decoded.role !== 'admin') {
      res.status(403).json({ error: 'Administrator privileges required.' });
      return;
    }

    const admin = await Admin.findById(decoded.sub).lean();
    if (!admin) {
      res.status(401).json({ error: 'Administrator account no longer exists.' });
      return;
    }

    req.admin = {
      id: String(admin._id),
      name: admin.name,
      email: admin.email,
      role: 'admin',
    };

    next();
  } catch {
    res.status(401).json({ error: 'Session expired or invalid token. Please sign in again.' });
  }
}

import { Request, Response, NextFunction } from 'express';
import db from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
      };
    }
  }
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('No token found');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-12345';
    console.log('Using JWT secret:', jwtSecret.substring(0, 5) + '...');
    
    const decoded = jwt.verify(token, jwtSecret) as {
      id: number;
      name: string;
      email: string;
    };

    console.log('Decoded token:', decoded);

    // Get user from database using select instead of query
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    console.log('Database query result:', user);

    if (!user) {
      console.log('User not found in database:', decoded.id);
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('Found user:', { id: user.id, name: user.name });

    // Add user to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(401).json({ error: 'Not authenticated' });
  }
};

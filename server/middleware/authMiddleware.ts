import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseIdToken } from '../config/firebaseAdmin';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization header' });
    return;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Empty bearer token' });
    return;
  }

  try {
    const verifiedUser = await verifyFirebaseIdToken(token);
    req.user = verifiedUser;
    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication token', details: err.message });
  }
}

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { IAuthRequest, IUser } from '../types';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const auth = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = (req as any).header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

export const adminAuth = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await auth(req, res, () => {
      if (req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
        return;
      }
      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};

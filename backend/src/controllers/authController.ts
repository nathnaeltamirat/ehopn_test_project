import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { IAuthRequest, IUserResponse, IAuthResponse } from '../types';
import { JWTPayload } from '../middleware/auth';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../utils/emailService';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, language } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      name,
      email,
      passwordHash,
      language,
      subscriptionPlan: 'Free'
    });

    await user.save();

    const subscription = new Subscription({
      userId: user._id,
      plan: 'Free',
      status: 'active'
    });

    await subscription.save();


    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '7d'
    });

  
    const userResponse: IUserResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      language: user.language,
      subscriptionPlan: user.subscriptionPlan
    };

    sendWelcomeEmail(email, name).catch(error => {
      console.error('Failed to send welcome email:', error);
    });

    const response: IAuthResponse = {
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

 
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '7d'
    });

   
    const userResponse: IUserResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      language: user.language,
      subscriptionPlan: user.subscriptionPlan
    };

    const response: IAuthResponse = {
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getCurrentUser = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    const userResponse: IUserResponse = {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      language: req.user.language,
      subscriptionPlan: req.user.subscriptionPlan
    };

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const googleAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {

    const user = (req as any).user;
    
    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      return;
    }

    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '7d'
    });


    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&success=true`);
  } catch (error) {
    console.error('Google auth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal if the email exists or not
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
      return;
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Store reset token in user document
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken, user.name);
    
    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      // Still return success to user for security reasons
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
      return;
    }

    // Verify and decode the token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
      return;
    }

    // Find user by ID from token
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
      return;
    }

    // Check if reset token matches and is not expired
    if (user.resetToken !== token || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
      return;
    }

    // Hash the new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update user's password and clear reset token
    user.passwordHash = passwordHash;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

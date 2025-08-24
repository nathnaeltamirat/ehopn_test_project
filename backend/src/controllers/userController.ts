import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { Invoice } from '../models/Invoice';
import { IAuthRequest, IApiResponse, IUserResponse } from '../types';

export const updateUserLanguage = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { language } = req.body;

   
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { language },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const response: IApiResponse = {
      success: true,
      message: 'Language updated successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateUserProfile = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { name, email } = req.body;

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
        return;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const formattedUser: IUserResponse = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      language: updatedUser.language,
      subscriptionPlan: updatedUser.subscriptionPlan
    };

    const response: IApiResponse<IUserResponse> = {
      success: true,
      message: 'Profile updated successfully',
      data: formattedUser
    };

    res.json(response);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const changePassword = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;


    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }


    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }


    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    user.passwordHash = newPasswordHash;
    await user.save();

    const response: IApiResponse = {
      success: true,
      message: 'Password changed successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteAccount = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { password } = req.body;

    if (!password) {
      res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
      return;
    }


    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
      return;
    }

  
    await Promise.all([

      Invoice.deleteMany({ userId: req.user._id }),
      Subscription.deleteMany({ userId: req.user._id }),
      User.findByIdAndDelete(req.user._id)
    ]);

    const response: IApiResponse = {
      success: true,
      message: 'Account deleted successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

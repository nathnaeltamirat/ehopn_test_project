import { Request } from 'express';
import { Types } from 'mongoose';

// User Types
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  language: 'en' | 'de' | 'ar';
  role: 'user' | 'admin';
  subscriptionPlan: 'Free' | 'Pro' | 'Business';
  googleId?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  language: string;
  subscriptionPlan: string;
}

// Invoice Types
export interface IInvoice {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  vendor: string;
  date: string;
  amount: string;
  taxId: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoiceResponse {
  id: string;
  userId: string;
  vendor: string;
  date: string;
  amount: string;
  taxId: string;
  fileUrl: string;
}

export interface IInvoiceUploadResponse {
  vendor: string;
  date: string;
  amount: number;
  taxId: string;
}

// Subscription Types
export interface ISubscription {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  plan: 'Free' | 'Pro' | 'Business';
  status: 'active' | 'canceled' | 'pending';
  renewDate: Date;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscriptionResponse {
  id: string;
  plan: string;
  status: string;
  renewDate: string;
  amount: number;
  currency: string;
  features: string[];
  uploadLimit: number;
  uploadsUsed: number;
  uploadsRemaining: number;
  chapaTxRef?: string;
}

// Auth Types
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  language: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: IUserResponse;
}

// API Response Types
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Request with User
export interface IAuthRequest extends Request {
  user?: IUser | any;
}

// Stripe Types
export interface IStripeSubscription {
  id: string;
  status: string;
  current_period_end: number;
  plan: {
    amount: number;
    currency: string;
  };
}

// File Upload Types
export interface IFileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}
declare module "tesseract.js";
declare module "pdf-parse";
declare module "@google/generative-ai";

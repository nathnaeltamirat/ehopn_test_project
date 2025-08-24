import { Request, Response } from 'express';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { IAuthRequest, ISubscriptionResponse, IApiResponse } from '../types';
import { Invoice } from '../models/Invoice'; // Added import for Invoice

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY!;
const CHAPA_PUBLIC_KEY = process.env.CHAPA_PUBLIC_KEY!;
const CHAPA_ENCRYPTION_KEY = process.env.CHAPA_ENCRYPTION_KEY!;
const CHAPA_BASE_URL = 'https://api.chapa.co/v1';

const SUBSCRIPTION_PLANS = {
  Free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'ETB',
    interval: 'month',
    uploadLimit: 5,
    features: ['Basic invoice uploads', 'Email support', '5 invoices per month'],
    description: 'Perfect for getting started'
  },
  Pro: {
    id: 'pro',
    name: 'Pro',
    price: 1500, 
    currency: 'ETB',
    interval: 'month',
    uploadLimit: -1, 
    features: ['Unlimited invoice uploads', 'Advanced OCR processing', 'Priority support', 'Export to multiple formats', 'API access'],
    description: 'Best for growing businesses'
  },
  Business: {
    id: 'business',
    name: 'Business',
    price: 5000, 
    currency: 'ETB',
    interval: 'month',
    uploadLimit: -1, 
    features: ['All Pro features', 'Dedicated support', 'Custom integrations', 'White-label options', 'Advanced analytics'],
    description: 'For enterprise needs'
  }
};


export const getSubscriptionPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = Object.values(SUBSCRIPTION_PLANS).map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      uploadLimit: plan.uploadLimit,
      features: plan.features,
      description: plan.description
    }));

    const response: IApiResponse<typeof plans> = {
      success: true,
      message: 'Subscription plans retrieved successfully',
      data: plans
    };

    res.json(response);
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


export const createChapaPayment = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { planId } = req.body;

 
    let planKey: keyof typeof SUBSCRIPTION_PLANS;
    if (SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]) {
      planKey = planId as keyof typeof SUBSCRIPTION_PLANS;
    } else {
      const foundPlan = Object.entries(SUBSCRIPTION_PLANS).find(([key, plan]) => plan.id === planId);
      if (!foundPlan) {
        res.status(400).json({
          success: false,
          message: 'Invalid subscription plan'
        });
        return;
      }
      planKey = foundPlan[0] as keyof typeof SUBSCRIPTION_PLANS;
    }

    const plan = SUBSCRIPTION_PLANS[planKey];

    
    if (planKey === 'Free') {
     
      const existingSubscription = await Subscription.findOne({ userId: req.user._id });
      if (existingSubscription) {
        existingSubscription.plan = 'Free';
        existingSubscription.status = 'active';
        await existingSubscription.save();
      } else {
     
        const subscription = new Subscription({
          userId: req.user._id,
          plan: 'Free',
          status: 'active'
        });
        await subscription.save();
      }


      await User.findByIdAndUpdate(req.user._id, { subscriptionPlan: 'Free' });

      const response: IApiResponse<ISubscriptionResponse> = {
        success: true,
        message: 'Free subscription activated successfully',
        data: {
          id: existingSubscription?._id.toString() || 'new',
          plan: 'Free',
          status: 'active',
          renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 0,
          currency: 'ETB',
          features: plan.features,

        } as any
      };

      res.json(response);
      return;
    }

    // Check if Chapa API key is configured
    if (!CHAPA_SECRET_KEY) {
      console.error('Chapa API key not configured properly');
      res.status(500).json({
        success: false,
        message: 'Chapa API key not configured. Please contact administrator.'
      });
      return;
    }

    console.log('Using Chapa API key:', CHAPA_SECRET_KEY.substring(0, 10) + '...');


    const txRef = `chapa-${req.user._id}-${Date.now()}`; 
    
    if (!process.env.FRONTEND_URL) {
      console.error('FRONTEND_URL environment variable not configured');
      res.status(500).json({
        success: false,
        message: 'Frontend URL not configured. Please contact administrator.'
      });
      return;
    }
    
    const callbackUrl = `${process.env.FRONTEND_URL}/settings?success=true&tx_ref=${txRef}`;
    console.log('Callback URL:', callbackUrl);

    const chapaPayload = {
      amount: plan.price,
      currency: plan.currency,
      email: req.user.email,
      first_name: req.user.name.split(' ')[0] || 'User',
      last_name: req.user.name.split(' ')[1] || 'Name',
      tx_ref: txRef,
      callback_url: callbackUrl,
      return_url: callbackUrl, 
      webhook_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/subscription/webhook`,
      customization: {
        title: `${plan.name} Plan`,
        description: plan.description
      },
      meta: {
        userId: req.user._id.toString(),
        planId: planKey,
        planName: plan.name,
        planPrice: plan.price
      }
    };

    console.log('Creating Chapa payment with payload:', JSON.stringify(chapaPayload, null, 2));
    
    const chapaResponse = await (globalThis as any).fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chapaPayload)
    });

    console.log('Chapa response status:', chapaResponse.status);
    const chapaData = await chapaResponse.json() as any; // Type assertion for now
    console.log('Chapa response data:', JSON.stringify(chapaData, null, 2));

    if (chapaData.status === 'success') {
      let subscription = await Subscription.findOne({ userId: req.user._id });
      if (subscription) {
        subscription.plan = planKey;
        subscription.status = 'pending'; // Set to pending until payment is confirmed
        subscription.chapaTxRef = txRef; // Store Chapa transaction reference
        await subscription.save();
      } else {
        subscription = new Subscription({
          userId: req.user._id,
          plan: planKey,
          status: 'pending', 
          renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
          chapaTxRef: txRef
        });
        await subscription.save();
      }

      const response: IApiResponse<{ checkoutUrl: string; txRef: string }> = {
        success: true,
        message: 'Chapa payment initiated successfully',
        data: {
          checkoutUrl: chapaData.data.checkout_url,
          txRef: txRef
        }
      };
      res.json(response);
    } else {
      console.error('Chapa API error:', chapaData);
      const errorMessage = chapaData.message || chapaData.error || 'Failed to initiate Chapa payment';
      res.status(400).json({
        success: false,
        message: errorMessage,
        details: chapaData
      });
    }
  } catch (error) {
    console.error('Create Chapa payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const verifyChapaPayment = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { txRef } = req.body;

    if (!txRef) {
      res.status(400).json({
        success: false,
        message: 'Transaction reference is required'
      });
      return;
    }


    const chapaResponse = await (globalThis as any).fetch(`${CHAPA_BASE_URL}/transaction/verify/${txRef}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET_KEY}`
      }
    });

    const chapaData = await chapaResponse.json() as any;

    if (chapaData.status === 'success' && chapaData.data.status === 'success') {
      const meta = chapaData.data.meta;
      const planId = meta?.planId;

      if (!planId || !SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]) {
        res.status(400).json({
          success: false,
          message: 'Invalid plan ID'
        });
        return;
      }

   
      const existingSubscription = await Subscription.findOne({ userId: req.user._id });
      if (existingSubscription) {

        existingSubscription.plan = planId;
        existingSubscription.status = 'active';
        existingSubscription.chapaTxRef = txRef;
        existingSubscription.renewDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await existingSubscription.save();
      } else {
 
        const subscription = new Subscription({
          userId: req.user._id,
          plan: planId,
          status: 'active',
          chapaTxRef: txRef,
          renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
        await subscription.save();
      }


      await User.findByIdAndUpdate(req.user._id, { subscriptionPlan: planId });

      const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
      const response: IApiResponse<ISubscriptionResponse> = {
        success: true,
        message: 'Subscription activated successfully',
        data: {
          id: existingSubscription?._id.toString() || 'new',
          plan: planId,
          status: 'active',
          renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: plan.price,
          currency: plan.currency,
          features: plan.features,
          uploadLimit: plan.uploadLimit,
          uploadsUsed: 0,
          uploadsRemaining: plan.uploadLimit === -1 ? -1 : plan.uploadLimit,
          chapaTxRef: txRef
        }
      };

      res.json(response);
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verify Chapa payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createSubscription = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { plan } = req.body;

    if (!SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]) {
      res.status(400).json({
        success: false,
        message: 'Invalid subscription plan'
      });
      return;
    }

    const existingSubscription = await Subscription.findOne({ userId: req.user._id });
    if (existingSubscription) {
      res.status(400).json({
        success: false,
        message: 'User already has a subscription'
      });
      return;
    }

    // For Free plan, create subscription without payment
    if (plan === 'Free') {
      const subscription = new Subscription({
        userId: req.user._id,
        plan: 'Free',
        status: 'active'
      });

      await subscription.save();

      // Update user's subscription plan
      await User.findByIdAndUpdate(req.user._id, { subscriptionPlan: 'Free' });

      const response: IApiResponse<ISubscriptionResponse> = {
        success: true,
        message: 'Free subscription created successfully',
        data: {
          id: subscription._id.toString(),
          plan: subscription.plan,
          status: subscription.status,
          renewDate: subscription.renewDate.toISOString(),
          amount: 0,
          currency: 'ETB',
          features: SUBSCRIPTION_PLANS.Free.features
        }as any
      };

      res.json(response);
      return;
    }

    res.status(400).json({
      success: false,
      message: 'Please use Chapa payment for paid plans'
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getCurrentSubscription = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const subscription = await Subscription.findOne({ userId: req.user._id });

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
      return;
    }

    const planConfig = SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS];


    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const invoiceCount = await Invoice.countDocuments({
      userId: req.user._id,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const response: IApiResponse<ISubscriptionResponse> = {
      success: true,
      message: 'Subscription retrieved successfully',
      data: {
        id: subscription._id.toString(),
        plan: subscription.plan,
        status: subscription.status,
        renewDate: subscription.renewDate.toISOString(),
        amount: planConfig.price,
        currency: planConfig.currency,
        features: planConfig.features,
        uploadLimit: planConfig.uploadLimit,
        uploadsUsed: invoiceCount,
        uploadsRemaining: planConfig.uploadLimit === -1 ? -1 : Math.max(0, planConfig.uploadLimit - invoiceCount),
        chapaTxRef: subscription.chapaTxRef
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const cancelSubscription = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const subscription = await Subscription.findOne({ userId: req.user._id });
    
    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
      return;
    }

 
    subscription.plan = 'Free';
    subscription.status = 'active';
    subscription.renewDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 
    await subscription.save();


    await User.findByIdAndUpdate(req.user._id, { subscriptionPlan: 'Free' });

    const response: IApiResponse = {
      success: true,
      message: 'Subscription canceled and downgraded to Free plan'
    };
    res.json(response);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


export const handleChapaWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Chapa webhook received:', JSON.stringify(req.body, null, 2));
    
    const { tx_ref, status, meta } = req.body;

    console.log('Webhook data:', {
      tx_ref,
      status,
      meta,
      fullBody: req.body
    });

    if (status === 'success' && meta?.userId && meta?.planId) {
      const userId = meta.userId;
      const planId = meta.planId;

      console.log('Processing successful payment for user:', userId, 'plan:', planId);


      const subscription = await Subscription.findOne({ userId });
      if (subscription) {
        subscription.status = 'active';
        subscription.plan = planId;
        subscription.chapaTxRef = tx_ref;
        subscription.renewDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await subscription.save();

 
        await User.findByIdAndUpdate(userId, { subscriptionPlan: planId });
        
        console.log('Subscription activated successfully for user:', userId);
      } else {
        console.log('No subscription found for user:', userId);
      }
    } else {
      console.log('Webhook data does not match expected format or status is not success');
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Chapa webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

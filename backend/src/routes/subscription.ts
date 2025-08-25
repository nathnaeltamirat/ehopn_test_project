import { Router } from 'express';
import { 
  createSubscription, 
  getCurrentSubscription, 
  cancelSubscription,
  handleChapaWebhook,
  getSubscriptionPlans,
  createChapaPayment,
  verifyChapaPayment
} from '../controllers/subscriptionController';

import { auth } from '../middleware/auth';

const router = Router();

router.get('/plans', getSubscriptionPlans);
router.post('/chapa-payment', auth as any, createChapaPayment);
router.post('/verify-payment', auth as any, verifyChapaPayment);
router.post('/create', auth as any, createSubscription);
router.get('/me', auth as any, getCurrentSubscription);
router.post('/cancel', auth as any, cancelSubscription);
router.post('/webhook', handleChapaWebhook);

export default router;

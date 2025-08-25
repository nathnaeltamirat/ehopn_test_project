const express = require('express');
const { 
  createSubscription, 
  getCurrentSubscription, 
  cancelSubscription,
  handleChapaWebhook,
  getSubscriptionPlans,
  createChapaPayment,
  verifyChapaPayment
} = require('../controllers/subscriptionController');
const { validateSubscription } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/plans', getSubscriptionPlans);
router.post('/chapa-payment', auth, createChapaPayment);
router.post('/verify-payment', auth, verifyChapaPayment);
router.post('/create', auth, validateSubscription, createSubscription);
router.get('/me', auth, getCurrentSubscription);
router.post('/cancel', auth, cancelSubscription);
router.post('/webhook', handleChapaWebhook);

module.exports = router;

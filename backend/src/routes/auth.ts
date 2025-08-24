import { Router } from 'express';
import passport from 'passport';
import { register, login, logout, getCurrentUser, googleAuthCallback, forgotPassword, resetPassword } from '../controllers/authController';
import { validateRegister, validateLogin } from '../middleware/validation';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/me', auth as any, getCurrentUser);
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
 
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    googleAuthCallback
  );
} else {

  router.get('/google', (req, res) => {
    res.status(400).json({
      success: false,
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.'
    });
  });

  router.get('/google/callback', (req, res) => {
    res.status(400).json({
      success: false,
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.'
    });
  });
}

export default router;

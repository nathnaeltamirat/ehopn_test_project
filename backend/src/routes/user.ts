import { Router } from 'express';
import { updateUserLanguage, updateUserProfile, changePassword, deleteAccount } from '../controllers/userController';
import { validateLanguage, validateProfile, validatePasswordChange, validateDeleteAccount } from '../middleware/validation';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth as any);

router.put('/language', validateLanguage, updateUserLanguage);
router.put('/profile', validateProfile, updateUserProfile);
router.put('/password', validatePasswordChange, changePassword);
router.delete('/account', validateDeleteAccount, deleteAccount);

export default router;

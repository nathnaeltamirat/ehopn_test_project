import { Router } from 'express';
import { updateUserLanguage, updateUserProfile, changePassword, deleteAccount } from '../controllers/userController';

import { auth } from '../middleware/auth';

const router = Router();

router.use(auth as any);

router.put('/language', updateUserLanguage);
router.put('/profile', updateUserProfile);
router.put('/password', changePassword);
router.delete('/account', deleteAccount);

export default router;

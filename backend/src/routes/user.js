const express = require('express');
const { 
  updateUserLanguage, 
  updateUserProfile, 
  changePassword, 
  deleteAccount 
} = require('../controllers/userController');
const { 
  validateLanguage, 
  validateProfile, 
  validatePasswordChange, 
  validateDeleteAccount 
} = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.put('/language', validateLanguage, updateUserLanguage);
router.put('/profile', validateProfile, updateUserProfile);
router.put('/password', validatePasswordChange, changePassword);
router.delete('/account', validateDeleteAccount, deleteAccount);

module.exports = router;

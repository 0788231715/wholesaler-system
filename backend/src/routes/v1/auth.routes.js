const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  updateDetails,
  forgotPassword,
  resetPassword,
  verifyEmail
} = require('../../controllers/auth.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.patch('/resetpassword/:token', resetPassword);
router.get('/verifyemail/:token', verifyEmail);

router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);

module.exports = router;
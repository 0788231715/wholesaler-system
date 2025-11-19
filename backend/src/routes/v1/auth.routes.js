const express = require('express');
const { 
  register, 
  login, 
  getMe, 
<<<<<<< HEAD
  updateDetails,
  forgotPassword,
  resetPassword,
  verifyEmail
=======
  updateDetails 
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
} = require('../../controllers/auth.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
<<<<<<< HEAD
router.post('/forgotpassword', forgotPassword);
router.patch('/resetpassword/:token', resetPassword);
router.get('/verifyemail/:token', verifyEmail);

=======
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);

module.exports = router;
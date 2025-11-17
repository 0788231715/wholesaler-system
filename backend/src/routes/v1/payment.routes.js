const express = require('express');
const { createPaymentIntent } = require('../../controllers/payment.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

// All routes in this file are protected
router.use(protect);

// Route to create a new payment intent
router.post('/create-payment-intent', createPaymentIntent);

module.exports = router;

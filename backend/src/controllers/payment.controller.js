const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a new payment intent
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const createPaymentIntent = async (req, res, next) => {
  const { amount, currency } = req.body;

  if (!amount || !currency) {
    return res.status(400).json({ success: false, message: 'Amount and currency are required' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
};

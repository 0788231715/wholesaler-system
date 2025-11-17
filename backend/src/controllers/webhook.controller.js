const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/order.model');

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`✅ PaymentIntent was successful for: ${paymentIntent.id}`);
      
      try {
        const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
        if (order) {
          order.paymentStatus = 'succeeded';
          order.status = 'processing'; // Update order status
          await order.save();
          console.log(`📦 Order ${order.orderNumber} payment status updated to succeeded.`);
        } else {
          console.warn(`⚠️  Order not found for paymentIntentId: ${paymentIntent.id}`);
        }
      } catch (error) {
        console.error('Error updating order status:', error);
      }
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object;
      console.log(`❌ PaymentIntent failed for: ${paymentIntentFailed.id}`);

      try {
        const order = await Order.findOne({ paymentIntentId: paymentIntentFailed.id });
        if (order) {
          order.paymentStatus = 'failed';
          await order.save();
          console.log(`📦 Order ${order.orderNumber} payment status updated to failed.`);
          // Optionally, you could trigger a process to notify the user.
        } else {
          console.warn(`⚠️  Order not found for paymentIntentId: ${paymentIntentFailed.id}`);
        }
      } catch (error) {
        console.error('Error updating order status:', error);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};

module.exports = {
  handleStripeWebhook,
};

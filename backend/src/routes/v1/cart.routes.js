const express = require('express');
const cartController = require('../../controllers/cart.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware.protect);

router
  .route('/')
  .get(cartController.getCart)
  .post(cartController.addItemToCart)
  .patch(cartController.updateCartItem)
  .delete(cartController.clearCart);

router
  .route('/:productId')
  .delete(cartController.removeItemFromCart);

module.exports = router;

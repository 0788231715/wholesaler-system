const express = require('express');
const cartController = require('../../controllers/cart.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware.protect);

router
  .route('/')
  .get(cartController.getCart)
  .post(cartController.addItemToCart)
  .delete(cartController.clearCart);

router.patch('/items', cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeItemFromCart);

module.exports = router;

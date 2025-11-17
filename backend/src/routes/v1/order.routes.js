const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  assignOrder,
  cancelOrder
} = require('../../controllers/order.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', authorize('retailer'), createOrder);
router.patch('/:id/status', authorize('admin', 'manager'), updateOrderStatus);
router.patch('/:id/assign', authorize('admin', 'manager'), assignOrder);
router.patch('/:id/cancel', cancelOrder);

module.exports = router;
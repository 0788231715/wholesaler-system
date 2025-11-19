const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
} = require('../../controllers/product.controller');
const { protect, optionalAuth } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

const router = express.Router();

router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProduct);

router.post('/', protect, authorize('admin', 'producer'), createProduct);
router.put('/:id', protect, authorize('admin', 'producer'), updateProduct);
router.delete('/:id', protect, authorize('admin', 'producer'), deleteProduct);
router.patch('/:id/stock', protect, authorize('admin', 'producer'), updateStock);

module.exports = router;
const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
} = require('../../controllers/product.controller');
<<<<<<< HEAD
const { protect, optionalAuth } = require('../../middlewares/auth.middleware');
=======
const { protect } = require('../../middlewares/auth.middleware');
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
const { authorize } = require('../../middlewares/role.middleware');

const router = express.Router();

<<<<<<< HEAD
router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProduct);

router.post('/', protect, authorize('admin', 'producer'), createProduct);
router.put('/:id', protect, authorize('admin', 'producer'), updateProduct);
router.delete('/:id', protect, authorize('admin', 'producer'), deleteProduct);
router.patch('/:id/stock', protect, authorize('admin', 'producer'), updateStock);
=======
router.use(protect);

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authorize('admin', 'producer'), createProduct);
router.put('/:id', authorize('admin', 'producer'), updateProduct);
router.delete('/:id', authorize('admin', 'producer'), deleteProduct);
router.patch('/:id/stock', authorize('admin', 'producer'), updateStock);
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c

module.exports = router;
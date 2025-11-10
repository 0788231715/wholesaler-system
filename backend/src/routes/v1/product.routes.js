const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock
} = require('../../controllers/product.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authorize('admin', 'producer'), createProduct);
router.put('/:id', authorize('admin', 'producer'), updateProduct);
router.delete('/:id', authorize('admin', 'producer'), deleteProduct);
router.patch('/:id/stock', authorize('admin', 'producer'), updateStock);

module.exports = router;
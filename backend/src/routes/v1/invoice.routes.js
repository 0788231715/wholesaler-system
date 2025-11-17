const express = require('express');
const {
  generateInvoice,
  getInvoices,
  getInvoice,
  downloadInvoice,
  updateInvoiceStatus
} = require('../../controllers/invoice.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.get('/:id/download', downloadInvoice);
router.post('/generate/:orderId', authorize('admin', 'manager'), generateInvoice);
router.patch('/:id/status', authorize('admin', 'manager'), updateInvoiceStatus);

module.exports = router;
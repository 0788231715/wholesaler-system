const express = require('express');
const reportService = require('../../services/report.service');
const invoiceService = require('../../services/invoice.service');
const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

// Dashboard data
router.get('/dashboard', authorize('admin', 'manager'), async (req, res) => {
  try {
    const data = await reportService.getDashboardData();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Sales reports
router.get('/sales', authorize('admin', 'manager'), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const data = await reportService.getSalesReport(startDate, endDate, groupBy);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Product performance
router.get('/products/performance', authorize('admin', 'manager'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await reportService.getProductPerformanceReport(startDate, endDate);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Stock report
router.get('/stock', authorize('admin', 'manager', 'producer'), async (req, res) => {
  try {
    const data = await reportService.getStockReport();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Customer report
router.get('/customers', authorize('admin', 'manager'), async (req, res) => {
  try {
    const data = await reportService.getCustomerReport();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Producer performance
router.get('/producers/performance', authorize('admin', 'manager'), async (req, res) => {
  try {
    const data = await reportService.getProducerPerformanceReport();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Financial reports
router.get('/financial/summary', authorize('admin', 'manager'), async (req, res) => {
  try {
    const data = await invoiceService.getFinancialSummary();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Monthly revenue
router.get('/revenue/monthly', authorize('admin', 'manager'), async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const data = await invoiceService.getMonthlyRevenue(year);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Outstanding invoices
router.get('/invoices/outstanding', authorize('admin', 'manager'), async (req, res) => {
  try {
    const data = await invoiceService.getOutstandingInvoices();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mark overdue invoices
router.post('/invoices/mark-overdue', authorize('admin'), async (req, res) => {
  try {
    const count = await invoiceService.markOverdueInvoices();
    res.json({
      success: true,
      message: `${count} invoices marked as overdue`,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
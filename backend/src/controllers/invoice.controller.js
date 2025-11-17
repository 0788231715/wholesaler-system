const Invoice = require('../models/invoice.model');
const Order = require('../models/order.model');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// @desc    Generate invoice for order
// @route   POST /api/v1/invoices/generate/:orderId
// @access  Private/Admin/Manager
exports.generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('retailer', 'name company address')
      .populate('items.product', 'name description price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if invoice already exists
    let invoice = await Invoice.findOne({ order: order._id });

    if (invoice) {
      return res.json({
        success: true,
        message: 'Invoice already exists',
        data: invoice
      });
    }

    // Calculate totals
    const subtotal = order.totalAmount;
    const taxRate = 0.18; // 18% VAT
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    // Create invoice
    invoice = await Invoice.create({
      order: order._id,
      retailer: order.retailer._id,
      items: order.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.total
      })),
      subtotal,
      taxRate: taxRate * 100, // Store as percentage
      taxAmount,
      totalAmount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    // Generate PDF
    const pdfBuffer = await generatePDF(invoice, order);

    // Save PDF to file system (in production, use cloud storage)
    const uploadsDir = path.join(__dirname, '../../uploads/invoices');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const pdfPath = path.join(uploadsDir, `${invoice.invoiceNumber}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Update invoice with PDF path
    invoice.pdfPath = pdfPath;
    await invoice.save();

    await invoice.populate('retailer', 'name company email address');
    await invoice.populate('order');

    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all invoices
// @route   GET /api/v1/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const { status, retailer, page = 1, limit = 10 } = req.query;

    let query = {};

    // Filter by status
    if (status) query.status = status;

    // For retailers, only show their invoices
    if (req.user.role === 'retailer') {
      query.retailer = req.user.id;
    }

    // Filter by retailer (for admin/manager)
    if (retailer && (req.user.role === 'admin' || req.user.role === 'manager')) {
      query.retailer = retailer;
    }

    const invoices = await Invoice.find(query)
      .populate('retailer', 'name company email')
      .populate('order')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      count: invoices.length,
      total,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single invoice
// @route   GET /api/v1/invoices/:id
// @access  Private
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('retailer', 'name company email address phone')
      .populate('order')
      .populate('order.items.product', 'name description');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check authorization
    if (req.user.role === 'retailer' && invoice.retailer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this invoice'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Download invoice PDF
// @route   GET /api/v1/invoices/:id/download
// @access  Private
exports.downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('retailer', 'name company address')
      .populate('order')
      .populate('order.items.product', 'name description price');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check authorization
    if (req.user.role === 'retailer' && invoice.retailer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this invoice'
      });
    }

    // Generate PDF if not exists
    if (!invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
      const pdfBuffer = await generatePDF(invoice, invoice.order);
      const uploadsDir = path.join(__dirname, '../../uploads/invoices');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const pdfPath = path.join(uploadsDir, `${invoice.invoiceNumber}.pdf`);
      fs.writeFileSync(pdfPath, pdfBuffer);
      invoice.pdfPath = pdfPath;
      await invoice.save();
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);
    
    const fileStream = fs.createReadStream(invoice.pdfPath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update invoice status
// @route   PATCH /api/v1/invoices/:id/status
// @access  Private/Admin/Manager
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status, paymentMethod } = req.body;

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status, paymentMethod },
      { new: true, runValidators: true }
    )
      .populate('retailer', 'name company email')
      .populate('order');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to generate PDF
async function generatePDF(invoice, order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('WHOLESALER SYSTEM', 50, 50);
      doc.fontSize(10).font('Helvetica').text('Invoice', 50, 80);
      
      // Invoice details
      doc.fontSize(12);
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 120);
      doc.text(`Issue Date: ${invoice.issueDate.toLocaleDateString()}`, 50, 140);
      doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, 50, 160);
      
      // Retailer information
      doc.text(`Bill To:`, 350, 120);
      doc.text(`${order.retailer.name}`, 350, 140);
      doc.text(`${order.retailer.company}`, 350, 160);
      if (order.retailer.address) {
        doc.text(`${order.retailer.address.street || ''}`, 350, 180);
        doc.text(`${order.retailer.address.city || ''}, ${order.retailer.address.state || ''} ${order.retailer.address.zipCode || ''}`, 350, 200);
      }

      // Table header
      let yPosition = 250;
      doc.font('Helvetica-Bold');
      doc.text('Description', 50, yPosition);
      doc.text('Quantity', 250, yPosition);
      doc.text('Unit Price', 350, yPosition);
      doc.text('Total', 450, yPosition);
      
      // Table rows
      doc.font('Helvetica');
      yPosition += 30;
      invoice.items.forEach(item => {
        doc.text(item.productName, 50, yPosition);
        doc.text(item.quantity.toString(), 250, yPosition);
        doc.text(`$${item.unitPrice.toFixed(2)}`, 350, yPosition);
        doc.text(`$${item.total.toFixed(2)}`, 450, yPosition);
        yPosition += 20;
      });

      // Totals
      yPosition += 20;
      doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 350, yPosition);
      yPosition += 20;
      doc.text(`Tax (${invoice.taxRate}%): $${invoice.taxAmount.toFixed(2)}`, 350, yPosition);
      yPosition += 20;
      doc.font('Helvetica-Bold').text(`Total: $${invoice.totalAmount.toFixed(2)}`, 350, yPosition);

      // Footer
      doc.font('Helvetica').fontSize(10);
      doc.text('Thank you for your business!', 50, 500);
      doc.text('Wholesaler System - Your trusted wholesale partner', 50, 520);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
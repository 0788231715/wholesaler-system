const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Invoice = require('../models/invoice.model');
const sendEmail = require('../utils/email');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private/Retailer
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, notes, paymentIntentId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have at least one item'
      });
    }

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Validate items and calculate total
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product is not available: ${product.name}`
        });
      }

      let price;
      let stock;
      let variant = null;

      if (product.hasVariants) {
        if (!item.variantId) {
          return res.status(400).json({
            success: false,
            message: `Variant ID is required for product: ${product.name}`
          });
        }
        variant = product.variants.id(item.variantId);
        if (!variant) {
          return res.status(404).json({
            success: false,
            message: `Variant not found for product: ${product.name}`
          });
        }
        price = variant.price;
        stock = variant.stock;
      } else {
        price = product.price;
        stock = product.stock;
      }

      if (stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}` + (variant ? ` (${variant.name})` : '')
        });
      }

      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        variant: variant ? variant._id : null,
        quantity: item.quantity,
        price: price,
        total: itemTotal
      });
    }

    // Create order
    const order = await Order.create({
      retailer: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      notes,
      paymentIntentId,
      paymentStatus: 'pending'
    });

    // Update product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product.hasVariants) {
        const variant = product.variants.id(item.variant);
        variant.stock -= item.quantity;
        await product.save();
      } else {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    await order.populate('retailer', 'name company email');
    await order.populate('items.product', 'name description images');

    // Send order confirmation email
    try {
      await sendEmail({
        email: order.retailer.email,
        subject: `Order Confirmation #${order.orderNumber}`,
        message: `Hi ${order.retailer.name},\n\nThank you for your order! Your order #${order.orderNumber} has been placed successfully.\n\nTotal Amount: $${order.totalAmount.toFixed(2)}\n\nWe will notify you once your order has been processed.\n\nBest regards,\nThe Wholesaler System Team`
      });
    } catch (emailError) {
      console.error('There was an error sending the order confirmation email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const { 
      status, 
      retailer, 
      producer,
      page = 1, 
      limit = 10 
    } = req.query;

    let query = {};

    // Filter by status
    if (status) query.status = status;

    // For retailers, only show their orders
    if (req.user.role === 'retailer') {
      query.retailer = req.user.id;
    }

    // For producers, show orders containing their products
    if (req.user.role === 'producer') {
      const products = await Product.find({ producer: req.user.id }).select('_id');
      const productIds = products.map(p => p._id);
      query['items.product'] = { $in: productIds };
    }

    // Filter by retailer (for admin/manager)
    if (retailer && (req.user.role === 'admin' || req.user.role === 'manager')) {
      query.retailer = retailer;
    }

    const orders = await Order.find(query)
      .populate('retailer', 'name company email')
      .populate('items.product', 'name price images producer')
      .populate('assignedTo', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('retailer', 'name company email phone address')
      .populate('items.product', 'name description price images producer hasVariants variants')
      .populate('assignedTo', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role === 'retailer' && order.retailer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/v1/orders/:id/status
// @access  Private/Admin/Manager
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, estimatedDelivery, notes } = req.body;

    const order = await Order.findById(req.params.id).populate('retailer', 'email name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status and other fields
    if (status) order.status = status;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
    if (notes) order.notes = notes;

    // Set actual delivery date if status is delivered
    if (status === 'delivered') {
      order.actualDelivery = new Date();
    }

    await order.save();

    await order.populate('items.product', 'name price images');

    // Send order status update email
    try {
        await sendEmail({
            email: order.retailer.email,
            subject: `Your Order #${order.orderNumber} has been ${status}`,
            message: `Hi ${order.retailer.name},\n\nThe status of your order #${order.orderNumber} has been updated to: ${status}.\n\n` + (status === 'shipped' ? `Estimated delivery: ${new Date(estimatedDelivery).toLocaleDateString()}` : '') + `\n\nBest regards,\nThe Wholesaler System Team`
        });
    } catch (emailError) {
        console.error('There was an error sending the order status update email:', emailError);
    }


    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Assign order to manager
// @route   PATCH /api/v1/orders/:id/assign
// @access  Private/Admin/Manager
exports.assignOrder = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true, runValidators: true }
    )
      .populate('retailer', 'name company email')
      .populate('assignedTo', 'name email')
      .populate('items.product', 'name price images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order assigned successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel order
// @route   PATCH /api/v1/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('retailer', 'email name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role === 'retailer' && order.retailer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Only allow cancellation for pending or processing orders
    if (!['pending', 'processing'].includes(order..status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Restore product stock
    for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product.hasVariants) {
            const variant = product.variants.id(item.variant);
            variant.stock += item.quantity;
            await product.save();
        } else {
            product.stock += item.quantity;
            await product.save();
        }
    }

    order.status = 'cancelled';
    await order.save();

    // Send order cancellation email
    try {
        await sendEmail({
            email: order.retailer.email,
            subject: `Your Order #${order.orderNumber} has been cancelled`,
            message: `Hi ${order.retailer.name},\n\nYour order #${order.orderNumber} has been successfully cancelled.\n\nIf you did not request this, please contact us immediately.\n\nBest regards,\nThe Wholesaler System Team`
        });
    } catch (emailError) {
        console.error('There was an error sending the order cancellation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
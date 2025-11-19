const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Invoice = require('../models/invoice.model');
<<<<<<< HEAD
const sendEmail = require('../utils/email');
=======
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private/Retailer
exports.createOrder = async (req, res) => {
  try {
<<<<<<< HEAD
    const { items, shippingAddress, notes, paymentIntentId } = req.body;
=======
    const { items, shippingAddress, notes } = req.body;
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have at least one item'
      });
    }

<<<<<<< HEAD
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

=======
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
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

<<<<<<< HEAD
=======
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}`
        });
      }

>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product is not available: ${product.name}`
        });
      }

<<<<<<< HEAD
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
=======
      const itemTotal = product.price * item.quantity;
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
<<<<<<< HEAD
        variant: variant ? variant._id : null,
        quantity: item.quantity,
        price: price,
=======
        quantity: item.quantity,
        price: product.price,
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
        total: itemTotal
      });
    }

    // Create order
    const order = await Order.create({
      retailer: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
<<<<<<< HEAD
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
=======
      notes
    });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
    }

    await order.populate('retailer', 'name company email');
    await order.populate('items.product', 'name description images');

<<<<<<< HEAD
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

=======
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
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
<<<<<<< HEAD
      .populate('items.product', 'name description price images producer hasVariants variants')
=======
      .populate('items.product', 'name description price images producer')
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
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

<<<<<<< HEAD
    const order = await Order.findById(req.params.id).populate('retailer', 'email name');
=======
    const order = await Order.findById(req.params.id);
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c

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

<<<<<<< HEAD
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


=======
    await order.populate('retailer', 'name company email');
    await order.populate('items.product', 'name price images');

>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
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
<<<<<<< HEAD
    const order = await Order.findById(req.params.id).populate('retailer', 'email name');
=======
    const order = await Order.findById(req.params.id);
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c

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
<<<<<<< HEAD
    if (!['pending', 'processing'].includes(order..status)) {
=======
    if (!['pending', 'processing'].includes(order.status)) {
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Restore product stock
    for (const item of order.items) {
<<<<<<< HEAD
        const product = await Product.findById(item.product);
        if (product.hasVariants) {
            const variant = product.variants.id(item.variant);
            variant.stock += item.quantity;
            await product.save();
        } else {
            product.stock += item.quantity;
            await product.save();
        }
=======
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
    }

    order.status = 'cancelled';
    await order.save();

<<<<<<< HEAD
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

=======
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
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
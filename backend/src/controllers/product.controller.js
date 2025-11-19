const Product = require('../models/product.model');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    const { 
      category, 
      producer, 
      minPrice, 
      maxPrice, 
      inStock, 
      page = 1, 
      limit = 10,
      search 
    } = req.query;

    let query = { isActive: true };

    if (category) query.category = category;
    if (producer) query.producer = producer;

    // NOTE: Price and stock filtering is not performant on large datasets with variants
    // and should be implemented with an aggregation pipeline for production environments.
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (req.user.role === 'producer') {
      query.producer = req.user.id;
    }

    let products = await Product.find(query)
      .populate('producer', 'name company')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Post-query filtering for stock. This is not ideal for pagination.
    if (inStock === 'true' || req.user.role === 'retailer') {
      products = products.filter(p => p.totalStock > 0);
    }

    const total = await Product.countDocuments(query); // This total count is now inaccurate due to post-filtering.

    res.json({
      success: true,
      count: products.length,
      total,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Private
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('producer', 'name company email phone');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create product
// @route   POST /api/v1/products
// @access  Private/Admin/Producer
exports.createProduct = async (req, res) => {
  try {
    if (req.user.role === 'producer') {
      req.body.producer = req.user.id;
    }

    const { hasVariants, variants } = req.body;

    if (hasVariants && (!variants || variants.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Product with variants must have at least one variant.'
      });
    }

    const product = await Product.create(req.body);

    await product.populate('producer', 'name company');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin/Producer
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (req.user.role === 'producer' && product.producer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }
    
    const { hasVariants, variants } = req.body;

    if (hasVariants && (!variants || variants.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Product with variants must have at least one variant.'
      });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('producer', 'name company');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin/Producer
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (req.user.role === 'producer' && product.producer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product stock
// @route   PATCH /api/v1/products/:id/stock
// @access  Private/Admin/Producer
exports.updateStock = async (req, res) => {
  try {
    const { stock, variantId } = req.body;
    const { id } = req.params;

    if (stock === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Stock value is required.'
        });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (req.user.role === 'producer' && product.producer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    if (product.hasVariants) {
      if (!variantId) {
        return res.status(400).json({
          success: false,
          message: 'Variant ID is required to update stock for a product with variants.'
        });
      }
      const variant = product.variants.id(variantId);
      if (!variant) {
        return res.status(404).json({
          success: false,
          message: 'Variant not found'
        });
      }
      variant.stock = stock;
    } else {
      product.stock = stock;
    }

    await product.save();

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
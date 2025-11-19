const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const AppError = require('../utils/appError');

exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate({
        path: 'items.product',
        select: 'name images hasVariants variants price stock'
    }).populate('items.variant');

    if (!cart) {
      // If no cart, create one
      const newCart = await Cart.create({ user: req.user.id, items: [] });
      return res.status(200).json({
        status: 'success',
        data: {
          cart: newCart,
        },
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.addItemToCart = async (req, res, next) => {
  const { productId, quantity, variantId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.hasVariants) {
        if (!variantId) {
            return next(new AppError('Please select a variant', 400));
        }
        const variant = product.variants.id(variantId);
        if (!variant) {
            return next(new AppError('Variant not found', 404));
        }
        if (variant.stock < quantity) {
            return next(new AppError('Insufficient stock for this variant', 400));
        }
    } else {
        if (product.stock < quantity) {
            return next(new AppError('Insufficient stock for this product', 400));
        }
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && (!variantId || item.variant?.toString() === variantId)
    );

    if (itemIndex > -1) {
      // Product variant exists in cart, update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Product does not exist in cart, add new item
      cart.items.push({ product: productId, quantity, variant: variantId });
    }

    await cart.save();
    await cart.populate({
        path: 'items.product',
        select: 'name images hasVariants variants price stock'
    }).populate('items.variant');

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  const { itemId, quantity } = req.body;

  try {
    if (quantity <= 0) {
        req.params.itemId = itemId;
        return exports.removeItemFromCart(req, res, next);
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const item = cart.items.id(itemId);

    if (item) {
      item.quantity = quantity;
      await cart.save();
      await cart.populate({
        path: 'items.product',
        select: 'name images hasVariants variants price stock'
    }).populate('items.variant');

      res.status(200).json({
        status: 'success',
        data: {
          cart,
        },
      });
    } else {
      return next(new AppError('Item not in cart', 404));
    }
  } catch (error) {
    next(error);
  }
};

exports.removeItemFromCart = async (req, res, next) => {
  const { itemId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const item = cart.items.id(itemId);
    if (item) {
        item.remove();
    } else {
        return next(new AppError('Item not in cart', 404));
    }

    await cart.save();
    await cart.populate({
        path: 'items.product',
        select: 'name images hasVariants variants price stock'
    }).populate('items.variant');

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    cart.items = [];
    await cart.save();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
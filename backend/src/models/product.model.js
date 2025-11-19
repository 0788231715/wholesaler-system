const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allows multiple null values for sku
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  attributes: {
    type: Map,
    of: String
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  // Price for products without variants
  price: {
    type: Number,
    min: 0,
    required: function() {
      return !this.hasVariants;
    }
  },
  sku: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  category: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    alt: String
  }],
  producer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  minOrderQuantity: {
    type: Number,
    default: 1
  },
  unit: {
    type: String,
    default: 'piece'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hasVariants: {
    type: Boolean,
    default: false
  },
  // Stock for products without variants
  stock: {
    type: Number,
    min: 0,
    default: 0,
    required: function() {
      return !this.hasVariants;
    }
  },
  variants: [variantSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


productSchema.virtual('totalStock').get(function() {
  if (this.hasVariants) {
    return this.variants.reduce((total, variant) => total + variant.stock, 0);
  }
  return this.stock;
});


module.exports = mongoose.model('Product', productSchema);
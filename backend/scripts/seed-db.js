const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../src/models/user.model');
const Product = require('../src/models/product.model');
const Order = require('../src/models/order.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wholesaler';

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@wholesaler.com',
        password: 'password123',
        role: 'admin',
        company: 'Wholesaler System',
        phone: '+250788123456',
        address: {
          street: 'KK 15 Ave',
          city: 'Kigali',
          state: 'Kigali',
          zipCode: '0000'
        }
      },
      {
        name: 'Manager User',
        email: 'manager@wholesaler.com',
        password: 'password123',
        role: 'manager',
        company: 'Wholesaler System',
        phone: '+250788123457',
        address: {
          street: 'KK 16 Ave',
          city: 'Kigali',
          state: 'Kigali',
          zipCode: '0000'
        }
      },
      {
        name: 'John Producer',
        email: 'producer@farm.com',
        password: 'password123',
        role: 'producer',
        company: 'Fresh Farms Ltd',
        phone: '+250788123458',
        address: {
          street: 'KG 11 St',
          city: 'Kigali',
          state: 'Kigali',
          zipCode: '0000'
        }
      },
      {
        name: 'Sarah Retailer',
        email: 'retailer@shop.com',
        password: 'password123',
        role: 'retailer',
        company: 'City Supermarket',
        phone: '+250788123459',
        address: {
          street: 'KN 12 Ave',
          city: 'Kigali',
          state: 'Kigali',
          zipCode: '0000'
        }
      },
      {
        name: 'Mike Retailer',
        email: 'mike@store.com',
        password: 'password123',
        role: 'retailer',
        company: 'Mike\'s Convenience Store',
        phone: '+250788123460',
        address: {
          street: 'KN 45 St',
          city: 'Kigali',
          state: 'Kigali',
          zipCode: '0000'
        }
      }
    ]);

    console.log('Created users');

    const [admin, manager, producer, retailer1, retailer2] = users;

    // Create products
    const products = await Product.create([
      {
        name: 'Fresh Tomatoes',
        description: 'Fresh organic tomatoes from local farms',
        price: 2.5,
        stock: 100,
        category: 'Vegetables',
        producer: producer._id,
        minOrderQuantity: 10,
        unit: 'kg',
        images: [
          { url: '/images/tomatoes.jpg', alt: 'Fresh Tomatoes' }
        ]
      },
      {
        name: 'Potatoes',
        description: 'Premium quality potatoes',
        price: 1.8,
        stock: 200,
        category: 'Vegetables',
        producer: producer._id,
        minOrderQuantity: 5,
        unit: 'kg',
        images: [
          { url: '/images/potatoes.jpg', alt: 'Potatoes' }
        ]
      },
      {
        name: 'Carrots',
        description: 'Sweet and crunchy carrots',
        price: 2.0,
        stock: 150,
        category: 'Vegetables',
        producer: producer._id,
        minOrderQuantity: 5,
        unit: 'kg',
        images: [
          { url: '/images/carrots.jpg', alt: 'Carrots' }
        ]
      },
      {
        name: 'Onions',
        description: 'Fresh red onions',
        price: 1.5,
        stock: 180,
        category: 'Vegetables',
        producer: producer._id,
        minOrderQuantity: 5,
        unit: 'kg',
        images: [
          { url: '/images/onions.jpg', alt: 'Onions' }
        ]
      },
      {
        name: 'Bell Peppers',
        description: 'Colorful bell peppers',
        price: 3.0,
        stock: 80,
        category: 'Vegetables',
        producer: producer._id,
        minOrderQuantity: 2,
        unit: 'kg',
        images: [
          { url: '/images/peppers.jpg', alt: 'Bell Peppers' }
        ]
      }
    ]);

    console.log('Created products');

    // Create orders
    const orders = await Order.create([
      {
        orderNumber: 'ORD001',
        retailer: retailer1._id,
        items: [
          {
            product: products[0]._id,
            quantity: 20,
            price: products[0].price,
            total: 20 * products[0].price
          },
          {
            product: products[1]._id,
            quantity: 15,
            price: products[1].price,
            total: 15 * products[1].price
          }
        ],
        totalAmount: (20 * products[0].price) + (15 * products[1].price),
        status: 'delivered',
        shippingAddress: retailer1.address,
        assignedTo: manager._id,
        notes: 'Please deliver before 3 PM'
      },
      {
        orderNumber: 'ORD002',
        retailer: retailer2._id,
        items: [
          {
            product: products[2]._id,
            quantity: 10,
            price: products[2].price,
            total: 10 * products[2].price
          },
          {
            product: products[3]._id,
            quantity: 8,
            price: products[3].price,
            total: 8 * products[3].price
          }
        ],
        totalAmount: (10 * products[2].price) + (8 * products[3].price),
        status: 'processing',
        shippingAddress: retailer2.address,
        assignedTo: manager._id
      },
      {
        orderNumber: 'ORD003',
        retailer: retailer1._id,
        items: [
          {
            product: products[4]._id,
            quantity: 5,
            price: products[4].price,
            total: 5 * products[4].price
          }
        ],
        totalAmount: 5 * products[4].price,
        status: 'pending',
        shippingAddress: retailer1.address
      }
    ]);

    console.log('Created orders');

    // Update product stock based on orders
    for (const order of orders) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    console.log('Updated product stock');

    console.log('Database seeded successfully!');
    console.log('\nSample Login Credentials:');
    console.log('Admin: admin@wholesaler.com / password123');
    console.log('Manager: manager@wholesaler.com / password123');
    console.log('Producer: producer@farm.com / password123');
    console.log('Retailer: retailer@shop.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');
const authRouter = require('../routes/v1/auth.routes');
const cartRouter = require('../routes/v1/cart.routes');
const errorHandler = require('../middlewares/error.middleware');

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/cart', cartRouter);
app.use(errorHandler);

let user;
let product;
let token;

beforeAll(async () => {
  const mongoUri = 'mongodb://localhost:27017/wholesaler-test';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await User.deleteMany({});
  await Product.deleteMany({});
  await Cart.deleteMany({});

  user = await User.create({
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password123',
    role: 'wholesaler',
  });

  product = await Product.create({
    name: 'Test Product',
    description: 'A product for testing',
    price: 100,
    category: 'Test',
  });

  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'testuser@example.com', password: 'password123' });
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Cart API', () => {
  it('should get an empty cart for a new user', async () => {
    const res = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.cart.items).toHaveLength(0);
  });

  it('should add an item to the cart', async () => {
    const res = await request(app)
      .post('/api/v1/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 1 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.cart.items).toHaveLength(1);
    expect(res.body.data.cart.items[0].product.name).toBe('Test Product');
    expect(res.body.data.cart.items[0].quantity).toBe(1);
  });

  it('should update the quantity of an item in the cart', async () => {
    const res = await request(app)
      .patch('/api/v1/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 5 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.cart.items[0].quantity).toBe(5);
  });

  it('should remove an item from the cart', async () => {
    const res = await request(app)
      .delete(`/api/v1/cart/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.cart.items).toHaveLength(0);
  });

  it('should clear the cart', async () => {
    // First add an item
    await request(app)
      .post('/api/v1/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, quantity: 1 });

    const res = await request(app)
      .delete('/api/v1/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);

    const cart = await Cart.findOne({ user: user._id });
    expect(cart.items).toHaveLength(0);
  });
});

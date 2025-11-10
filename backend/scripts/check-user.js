const mongoose = require('mongoose');
const User = require('../src/models/user.model');
require('dotenv').config({ path: __dirname + '/../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wholesaler';

async function check(email) {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found');
    } else {
      console.log('User found:');
      console.log('id:', user._id.toString());
      console.log('email:', user.email);
      console.log('name:', user.name);
      console.log('role:', user.role);
      console.log('password hash:', user.password);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node check-user.js <email>');
  process.exit(1);
}

check(email);

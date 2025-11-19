<<<<<<< HEAD
const crypto = require('crypto');
=======
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
<<<<<<< HEAD
    minlength: 6,
    select: false
=======
    minlength: 6
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'producer', 'retailer'],
    required: true
  },
  company: {
    type: String,
    required: true
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  isActive: {
    type: Boolean,
    default: true
<<<<<<< HEAD
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
=======
  }
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

<<<<<<< HEAD
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

userSchema.methods.createVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    this.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    return verificationToken;
};

=======
>>>>>>> 65116c68f261c74f67ceae01e5447223a85fc89c
module.exports = mongoose.model('User', userSchema);
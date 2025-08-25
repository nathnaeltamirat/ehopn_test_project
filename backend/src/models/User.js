const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  language: {
    type: String,
    enum: ['en', 'de', 'ar'],
    default: 'en'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscriptionPlan: {
    type: String,
    enum: ['Free', 'Pro', 'Business'],
    default: 'Free'
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  resetToken: {
    type: String,
    default: undefined
  },
  resetTokenExpires: {
    type: Date,
    default: undefined
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { _id, passwordHash, __v, ...userWithoutSensitiveData } = ret;
      return {
        id: _id,
        ...userWithoutSensitiveData
      };
    }
  }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();

  if (this.passwordHash && (this.passwordHash.startsWith('$2a$') || this.passwordHash.startsWith('$2b$') || this.passwordHash.startsWith('$2y$'))) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

UserSchema.index({ email: 1 });

const User = mongoose.model('User', UserSchema);

module.exports = { User };

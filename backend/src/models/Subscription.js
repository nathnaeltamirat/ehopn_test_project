const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['Free', 'Pro', 'Business'],
    required: [true, 'Plan is required'],
    default: 'Free'
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'pending'],
    required: [true, 'Status is required'],
    default: 'active'
  },
  renewDate: {
    type: Date,
    required: [true, 'Renew date is required'],
    default: function() {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    }
  },
  chapaTxRef: {
    type: String,
    sparse: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { _id, __v, ...subscriptionData } = ret;
      return {
        id: _id,
        ...subscriptionData
      };
    }
  }
});

SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ renewDate: 1 });

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = { Subscription };

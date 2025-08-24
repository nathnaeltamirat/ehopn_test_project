import mongoose, { Schema, Document } from 'mongoose';
import { ISubscription } from '../types';

export interface ISubscriptionDocument extends Omit<ISubscription, '_id'>, Document {
  chapaTxRef?: string;
}

const SubscriptionSchema = new Schema<ISubscriptionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
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

export const Subscription = mongoose.model<ISubscriptionDocument>('Subscription', SubscriptionSchema);

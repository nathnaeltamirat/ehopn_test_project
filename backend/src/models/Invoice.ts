import mongoose, { Schema, Document } from 'mongoose';
import { IInvoice } from '../types';

export interface IInvoiceDocument extends Omit<IInvoice, '_id'>, Document {
  _id: any; 
}


const InvoiceSchema = new Schema<IInvoiceDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  vendor: {
    type: String,
    required: [true, 'Vendor is required'],
    trim: true,
    maxlength: [200, 'Vendor name cannot be more than 200 characters']
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    validate: {
      validator: function(v: string) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  amount: {
    type: String,
    required: [true, 'Amount is required'],
    validate: {
      validator: function(v: string) {
        return /^\d+(\.\d{1,2})?$/.test(v);
      },
      message: 'Amount must be a valid number with up to 2 decimal places'
    }
  },
  taxId: {
    type: String,
    required: [true, 'Tax ID is required'],
    trim: true,
    maxlength: [50, 'Tax ID cannot be more than 50 characters']
  },
  fileUrl: {
    type: String,
    required: false,
    trim: true,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

InvoiceSchema.index({ userId: 1, createdAt: -1 });
InvoiceSchema.index({ vendor: 1 });
InvoiceSchema.index({ date: 1 });

export const Invoice = mongoose.model<IInvoiceDocument>('Invoice', InvoiceSchema);

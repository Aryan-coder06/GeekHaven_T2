import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const orderItemSchema = new Schema({
  listingId: { type: Types.ObjectId, ref: 'Listing', required: true },
  titleSnapshot: { type: String, required: true },
  priceAtPurchase: { type: Number, required: true },
  qty: { type: Number, required: true }
}, { _id: true });

const orderSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  subtotal: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['PAID','FAILED'], required: true },
  invoiceNo: { type: String, unique: true, required: true },
  items: { type: [orderItemSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);

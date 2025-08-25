import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const cartItemSchema = new Schema({
  listingId: { type: Types.ObjectId, ref: 'Listing', required: true },
  qty: { type: Number, default: 1, min: 1 }
}, { _id: true });

const cartSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', unique: true, required: true },
  items: { type: [cartItemSchema], default: [] }
}, { timestamps: true });

export const Cart = mongoose.model('Cart', cartSchema);

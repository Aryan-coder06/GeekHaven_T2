import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const listingSchema = new Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // paise
  category: { type: String, index: true },
  location: String,
  images: { type: Array, default: [] },
  sellerId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  sku: { type: String, required: true, unique: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
listingSchema.index({ createdAt: -1 });
listingSchema.pre('save', function(next){ this.updatedAt = new Date(); next(); });

export const Listing = mongoose.model('Listing', listingSchema);

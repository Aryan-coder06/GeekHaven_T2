import mongoose from 'mongoose';
import { skuFrom } from '../utils/seed.js'; 

const { Schema, Types } = mongoose;

const listingSchema = new Schema({
  title:      { type: String, required: true, index: true, trim: true },
  description:{ type: String, required: true, trim: true },
  price:      { type: Number, required: true, min: 0 }, // paise
  category:   { type: String, index: true, trim: true },
  location:   { type: String, trim: true },
  images:     { type: [String], default: [] },
  sellerId:   { type: Types.ObjectId, ref: 'User', required: true, index: true },

  sku:        { type: String, unique: true, immutable: true },

  sellerEmail: { type: String},
  isFeatured: { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now },
  updatedAt:  { type: Date, default: Date.now }
});

listingSchema.index({ createdAt: -1 });
listingSchema.index({ location: 1});
listingSchema.index({ category: 1, price: 1, createdAt: -1 });
listingSchema.index({ title: 'text', description: 'text' });

listingSchema.pre('validate', function (next) {
  if (!this.sku && this._id) this.sku = skuFrom(this._id.toString());
  next();
});

listingSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Listing =
  mongoose.models.Listing || mongoose.model('Listing', listingSchema);

export default Listing;     // tryinh to fix<-- default export for `import Listing from ...`
export { Listing };        

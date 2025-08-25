import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const reviewSchema = new Schema({
  listingId: { type: Types.ObjectId, ref: 'Listing', required: true, index: true },
  reviewerId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});
reviewSchema.index({ listingId: 1, reviewerId: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);

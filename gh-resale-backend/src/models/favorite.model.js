import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const favoriteSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  listingId: { type: Types.ObjectId, ref: 'Listing', required: true }
}, { timestamps: true });

favoriteSchema.index({ userId: 1, listingId: 1 }, { unique: true });
export const Favorite = mongoose.model('Favorite', favoriteSchema);

import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const idemKeySchema = new Schema({
  _id: { type: String, required: true }, // Idempotency-Key
  endpoint: { type: String, required: true },
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  requestHash: { type: String, required: true },
  responseJson: { type: Schema.Types.Mixed, default: null },
  status: { type: String, enum: ['IN_PROGRESS','DONE'], default: 'IN_PROGRESS' },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

idemKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); 
export const IdemKey = mongoose.model('IdemKey', idemKeySchema);

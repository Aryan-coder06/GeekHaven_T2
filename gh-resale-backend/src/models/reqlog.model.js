import mongoose from 'mongoose';
const { Schema } = mongoose;

const reqLogSchema = new Schema({
  method: String,
  path: String,
  ipHash: String,
  redactedBody: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

export const ReqLog = mongoose.model('ReqLog', reqLogSchema);
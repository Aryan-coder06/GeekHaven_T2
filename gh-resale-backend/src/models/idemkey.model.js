import mongoose from 'mongoose';
const { Schema } = mongoose;

const IdemKeySchema = new Schema(
  {
    _id: { type: String, required: true },
    endpoint: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null }, 
    requestHash: { type: String, required: true },     
    responseJson: { type: Schema.Types.Mixed, default: null },
    status: { type: String, enum: ['IN_PROGRESS', 'DONE'], default: 'IN_PROGRESS' },
    expiresAt: { type: Date, required: true },         
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

IdemKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const IdemKey = mongoose.models.IdemKey || mongoose.model('IdemKey', IdemKeySchema);



export default IdemKey;
export {IdemKey};
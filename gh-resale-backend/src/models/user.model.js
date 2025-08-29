import mongoose from "mongoose";

const sellerProfileSchema = new mongoose.Schema({
  shopName: String,
  bio: String,
  avatarUrl: String,
  address: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email:{ type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },

  role: { type: String, enum: ['USER','SELLER','ADMIN'], default: 'USER' },

  isAccountVerified: { type: Boolean, default: false },
  verifyOtp: { type: String, default: "" },
  verifyOtpExpireAt: { type: Number, default: 0 },
  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Number, default: 0 },

  phone: String,
  location: String,

  sellerProfile: sellerProfileSchema,

  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.user || mongoose.model("user", userSchema);
export default User;

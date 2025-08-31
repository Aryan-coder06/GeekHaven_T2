import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const cartItemSchema = new Schema({
  listingId: { 
    type: Types.ObjectId, 
    ref: "Listing", 
    required: true 
  },
  qty: { 
    type: Number, 
    min: 1, 
    default: 1 
  },
  addedAt: { 
    type: Date, 
    default: Date.now 
  },
});

const cartSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  items: { type: [cartItemSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

cartSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
export default Cart;
export { Cart };

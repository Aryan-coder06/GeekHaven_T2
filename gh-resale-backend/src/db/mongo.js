import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Listing } from '../models/listing.model.js';
import { Favorite } from '../models/favorite.model.js';
import { Cart } from '../models/cart.model.js';
import { Order } from '../models/order.model.js';
import { Review } from '../models/review.model.js';
import { IdemKey } from '../models/idemkey.model.js';
import { ReqLog } from '../models/reqlog.model.js';

export async function connectMongo(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log('✅ Mongo connected');

  // ensure important indexes (unique pairs, TTL, etc.)
  await Promise.all([
    User.createIndexes(),
    Listing.createIndexes(),
    Favorite.createIndexes(),
    Cart.createIndexes(),
    Order.createIndexes(),
    Review.createIndexes(),
    IdemKey.createIndexes(),
    ReqLog.createIndexes(),
  ]);
}

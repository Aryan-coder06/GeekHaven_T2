// routes/checkout.route.js
import express from 'express';
import idempotency from '../middlewares/idempotency.js';
import { platformFeeBackend, parseSeedNumber, hmacSignature } from '../utils/seed.js';
import Order from '../models/order.model.js';
import Listing from '../models/listing.model.js';

const router = express.Router();

// rate-limit middleware: 7/min/IP (add your existing one)
router.post('/', /*authGuard,*/ idempotency, async (req, res, next) => {
  try {
    const { items = [], subtotal = 0 } = req.body;

    const ids = items.map(i => i.listingId);
    const listings = await Listing.find(
      { 
        _id: { 
          $in: ids 
        } 
      }
    ).lean();
    const byId = Object.fromEntries(listings.map(l => [String(l._id), l]));
    const orderItems = items.map(i => ({
      listingId: i.listingId,
      titleSnapshot: byId[i.listingId]?.title || 'Unknown',
      priceAtPurchase: byId[i.listingId]?.price || 0,
      qty: i.qty || 1
    }));

    const platformFee = platformFeeBackend(subtotal);
    const total = subtotal + platformFee;
    const { asMod10 } = parseSeedNumber();

    const response = {
      ok: true,
      subtotal,
      platformFee,
      nFromSeed: asMod10,
      chargedTotal: total
    };

    // (Optional) write an Order when integrating payments; for now you can skip
    // const order = await Order.create({ userId: req.user.id, subtotal, platformFee, total, status:'PAID', invoiceNo: 'INV...' , items: orderItems });

    res.set('X-Signature', hmacSignature(response));
    res.json(response);
  } catch (e) { next(e); }
});

export default router;

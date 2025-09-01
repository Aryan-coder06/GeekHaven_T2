// // routes/checkout.route.js
// import express from 'express';
// import idempotency from '../middlewares/idempotency.js';
// import { platformFeeBackend, parseSeedNumber, hmacSignature } from '../utils/seed.js';
// import Order from '../models/order.model.js';
// import Listing from '../models/listing.model.js';

// const router = express.Router();

// // rate-limit middleware: 7/min/IP (add your existing one)
// router.post('/', /*authGuard,*/ idempotency, async (req, res, next) => {
//   try {
//     const { items = [], subtotal = 0 } = req.body;

//     const ids = items.map(i => i.listingId);
//     const listings = await Listing.find(
//       { 
//         _id: { 
//           $in: ids 
//         } 
//       }
//     ).lean();
//     const byId = Object.fromEntries(listings.map(l => [String(l._id), l]));
//     const orderItems = items.map(i => ({
//       listingId: i.listingId,
//       titleSnapshot: byId[i.listingId]?.title || 'Unknown',
//       priceAtPurchase: byId[i.listingId]?.price || 0,
//       qty: i.qty || 1
//     }));

//     const platformFee = platformFeeBackend(subtotal);
//     const total = subtotal + platformFee;
//     const { asMod10 } = parseSeedNumber();

//     const response = {
//       ok: true,
//       subtotal,
//       platformFee,
//       nFromSeed: asMod10,
//       chargedTotal: total
//     };

//     // (Optional) write an Order when integrating payments; for now you can skip
//     // const order = await Order.create({ userId: req.user.id, subtotal, platformFee, total, status:'PAID', invoiceNo: 'INV...' , items: orderItems });

//     res.set('X-Signature', hmacSignature(response));
//     res.json(response);
//   } catch (e) { next(e); }
// });

// export default router;
// backend/src/routes/checkout.route.js




//////////////////////////////////////////////////////////////////////////
import express from 'express';
import idempotency from '../middlewares/idempotency.js';
import userAuth from '../middlewares/userAuth.js';
import {
  platformFeeBackend,
  getSeedNumberDigits,
  hmacSignature,
  canonicalJSONStringify,
} from '../utils/seed.js';
import Order from '../models/order.model.js';
import Listing from '../models/listing.model.js';

const router = express.Router();

// POST /checkout
router.post('/',  userAuth,  idempotency, async (req, res, next) => {
  try {
    const { items = [], subtotal = 0 } = req.body || {};
    const ids = items.map((i) => i.listingId).filter(Boolean);
    const listings = ids.length
      ? await Listing.find({ _id: { $in: ids } }).lean()
      : [];
    const byId = Object.fromEntries(listings.map((l) => [String(l._id), l]));

    const orderItems = items.map((i) => ({
      listingId: i.listingId,
      titleSnapshot: byId[i.listingId]?.title || 'Unknown',
      priceAtPurchase: byId[i.listingId]?.price || 0, 
      qty: i.qty || 1,
    }));
    const platformFee = platformFeeBackend(subtotal);
    const total = Number(subtotal) + Number(platformFee);
    const seedNumber = getSeedNumberDigits(); 

    const response = {
      ok: true,
      subtotal,           // major units (e.g., rupees/dollars)
      platformFee,        // major units
      nFromSeed: seedNumber,
      chargedTotal: total,  
      // orderId: `order_${Date.now()}`,
      // timestamp: new Date().toISOString(),
      // items: orderItems,
    };

    // HMAC-sign the exact JSON string we will send
    const body = canonicalJSONStringify(response);
    const sig = hmacSignature(response);
    res.setHeader('X-Signature', sig);
    res.setHeader('Access-Control-Expose-Headers', 'X-Signature');

    res.status(200).type('application/json').send(body);

  } catch (e) {
    next(e);
  }
});

export default router;

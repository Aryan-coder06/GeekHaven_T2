import express from 'express';
import Listing from '../models/listing.model.js';
// import { authGuard, sellerGuard } from '../middlewares/userAuth.js'; // when you re-enable auth

const router = express.Router();

// GET /listings?search=&category=&min=&max=&page=1
router.get('/', async (req, res, next) => {
  try {
    const { search = '', category, min, max, page = 1 } = req.query;
    const q = {};
    if (search) q.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    if (category) q.category = category;
    if (min) q.price = { ...q.price, $gte: Number(min) };
    if (max) q.price = { ...q.price, $lte: Number(max) };

    const limit = 10;
    const docs = await Listing.find(q)
      .sort({ createdAt: -1 })
      .skip((Number(page)-1)*limit)
      .limit(limit)
      .lean();

    res.json({ listings: docs, nextPage: docs.length === limit ? Number(page)+1 : null });
  } catch (e) { next(e); }
});

// GET /listings/:id
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await Listing.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) { next(e); }
});

// POST /listings  (enable guards later)
router.post('/', /*authGuard, sellerGuard,*/ async (req, res, next) => {
  try {
    const listing = new Listing({
      ...req.body,
      // sellerId: req.user.id  // when auth is on
    });
    await listing.save(); // SKU gets auto-filled by pre('validate')
    res.status(201).json(listing);
  } catch (e) { next(e); }
});

// PATCH /listings/:id
router.patch('/:id', /*authGuard, sellerGuard,*/ async (req, res, next) => {
  try {
    const doc = await Listing.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) { next(e); }
});

// DELETE /listings/:id
router.delete('/:id', /*authGuard, sellerGuard,*/ async (req, res, next) => {
  try {
    const r = await Listing.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;

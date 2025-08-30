import express from 'express';
import Listing from '../models/listing.model.js';
// import { authGuard, sellerGuard } from '../middlewares/userAuth.js'; // when you re-enable auth

const router = express.Router();


// GET /listings?search=&category=&min=&max=&page=1&limit=12&sort=-createdAt
router.get('/', async (req, res, next) => {
  try {
    const {
      search = '',
      category,
      min,
      max,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    const q = {};
    if (search) {
      q.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) q.category = category;
    if (min) q.price = { ...q.price, $gte: Number(min) };
    if (max) q.price = { ...q.price, $lte: Number(max) };

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Listing.find(q)
        .populate('sellerId', 'name avatar sellerProfile rating')
        .sort(String(sort))
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Listing.countDocuments(q),
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (e) { next(e); }
});

// GET /listings/:id
router.get('/:id', async (req, res, next) => {
  try {
    const item = await Listing.findById(req.params.id)
      .populate('sellerId', 'name avatar sellerProfile rating')
      .lean();
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
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

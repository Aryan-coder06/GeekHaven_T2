import express from 'express';
import Listing from '../models/listing.model.js';

const router = express.Router();
const esc = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function buildSort(sort) {
  const s = String(sort || '').trim();
  switch (s) {
    case 'price_asc': return { price: 1 };
    case 'price_desc': return { price: -1 };
    case 'oldest': return { createdAt: 1 };
    case 'newest': return { createdAt: -1 };
    default:
      if (s) return s;
      return { createdAt: -1 };
  }
}

// GET /listings?search=&category=&location=&min=&max=&page=1&limit=12&sort=newest
router.get('/', async (req, res, next) => {
  try {
    const {
      search = '',
      category,
      location,
      min,
      max,
      page = 1,
      limit = 12,
      sort = 'newest',
    } = req.query;

    const q = {};

    // keyword search (title/description/category)
    if (search && String(search).trim()) {
      const s = String(search).trim();
      q.$or = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } },
      ];
    }

    if (category) {
      q.category = { $regex: `^${esc(category)}$`, $options: 'i' };
    }
    if (location) {
      q.location = { $regex: `^${esc(location)}$`, $options: 'i' };
    }

    const minN = Number(min);
    const maxN = Number(max);
    if (Number.isFinite(minN) || Number.isFinite(maxN)) {
      q.price = {};
      if (Number.isFinite(minN)) q.price.$gte = Math.max(0, Math.floor(minN * 100));
      if (Number.isFinite(maxN)) q.price.$lte = Math.max(0, Math.floor(maxN * 100));
    }

    const pageN = Math.max(1, parseInt(page, 10) || 1);
    const limitN = Math.min(60, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageN - 1) * limitN;

    const sortSpec = buildSort(sort);

    const [items, total] = await Promise.all([
      Listing.find(q)
        .populate('sellerId', 'name avatar sellerProfile rating')
        .sort(sortSpec)
        .skip(skip)
        .limit(limitN)
        .lean(),
      Listing.countDocuments(q),
    ]);

    res.json({ items, total, page: pageN, limit: limitN });
  } catch (e) {
    next(e);
  }
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

export default router;

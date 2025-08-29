import express from 'express';
import Favorite from '../models/favorite.model.js';

const router = express.Router();

router.get('/', /*authGuard,*/ async (req,res,next)=>{
  try {
    const userId = req.user?.id || req.query.userId; 
    const favs = await Favorite.find({ userId }).lean();
    res.json({ favorites: favs });
  } catch (e) { next(e); }
});

router.post('/:listingId', /*authGuard,*/ async (req,res,next)=>{
  try {
    const userId = req.user?.id || req.body.userId;
    const listingId = req.params.listingId;
    await Favorite.updateOne({ userId, listingId }, { userId, listingId }, { upsert: true });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete('/:listingId', /*authGuard,*/ async (req,res,next)=>{
  try {
    const userId = req.user?.id || req.query.userId;
    await Favorite.deleteOne({ userId, listingId: req.params.listingId });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;

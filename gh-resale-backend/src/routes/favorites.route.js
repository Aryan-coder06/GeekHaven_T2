import express from 'express';
import Favorite from '../models/favorite.model.js';
import userAuth from '../middlewares/userAuth.js';
const router = express.Router();  

router.get('/', userAuth, async (req,res,next)=>{
  try {
    const userId = req.user?._id?.toString() || req.query.userId;
    if (!userId) return res.status(401).json({ message: 'userId required' });
    const favs = await Favorite.find({ userId }).lean();
    res.json({ favorites: favs });
  } catch (e) { next(e); }
});



router.post('/:listingId', userAuth, async (req,res,next)=>{
   try {
    const userId = req.user?._id?.toString() || req.body.userId;
     const { listingId } = req.params;
    if (!userId) return res.status(401).json({ message: 'userId required' });
     await Favorite.updateOne({ userId, listingId }, { userId, listingId }, { upsert: true });
     res.json({ ok: true });
   } catch (e) { next(e); }
 });

router.delete('/:listingId', userAuth, async (req,res,next)=>{
   try {
    const userId = req.user?._id?.toString() || req.query.userId;
    if (!userId) return res.status(401).json({ message: 'userId required' });
     await Favorite.deleteOne({ userId, listingId: req.params.listingId });
     res.json({ ok: true });
   } catch (e) { next(e); }
 });

export default router;

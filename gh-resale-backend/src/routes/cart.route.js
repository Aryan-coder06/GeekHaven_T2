import express from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Listing from "../models/listing.model.js";
import userAuth from "../middlewares/userAuth.js";

const router = express.Router();

async function getCartFor(userId) {
  const cart = await Cart.findOne({ userId }).populate({
    path: "items.listingId",
    select: "title price images category location sellerId sku",
    populate: { path: "sellerId", select: "name sellerProfile rating avatar" },
  }).lean();
  return cart || { userId, items: [] };
}

// GET /cart --> Working finally !!1
router.get("/", userAuth, async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const cart = await getCartFor(userId);
    const subtotal = cart.items.reduce((sum, it) => sum + ((it?.listingId?.price || 0) * (it?.qty || 0)), 0);
    res.json({ items: cart.items, subtotal });
  } catch (e) { next(e); }
});

// POST /cart  { listingId, qty }
router.post("/", userAuth, async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { listingId, qty = 1 } = req.body;

    if (!listingId) return res.status(400).json({ message: "listingId required" });
    if (!mongoose.isValidObjectId(listingId)) return res.status(400).json({ message: "Invalid listingId" });
    if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ message: "qty must be > 0" });

    const exists = await Listing.exists({ _id: listingId });
    if (!exists) return res.status(404).json({ message: "Listing not found" });

    const incRes = await Cart.updateOne(
      { userId, "items.listingId": listingId },
      { $inc: { "items.$.qty": qty } }
    );

    const matched = incRes.matchedCount ?? incRes.nMatched ?? incRes.n ?? 0;

    if (matched === 0) {
      await Cart.updateOne(
        { userId },
        { $setOnInsert: { userId }, $push: { items: { listingId, qty } } },
        { upsert: true }
      );
    }

    const cart = await getCartFor(userId);
    const subtotal = cart.items.reduce((sum, it) => sum + ((it?.listingId?.price || 0) * (it?.qty || 0)), 0);
    res.json({ items: cart.items, subtotal });
  } catch (e) {
    console.error("POST /cart error:", e);
    next(e);
  }
});

router.patch("/:listingId", userAuth, async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { listingId } = req.params;
    const { qty } = req.body;

    if (!mongoose.isValidObjectId(listingId)) return res.status(400).json({ message: "Invalid listingId" });
    if (!Number.isFinite(qty)) return res.status(400).json({ message: "qty required" });

    if (qty <= 0) {
      await Cart.updateOne({ userId }, { $pull: { items: { listingId } } });
    } else {
      // 1) set qty if line exists — NO upsert
      const upd = await Cart.updateOne(
        { userId, "items.listingId": listingId },
        { $set: { "items.$.qty": qty } }
      );
      const matched = upd.matchedCount ?? upd.nMatched ?? upd.n ?? 0;

      if (matched === 0) {
        await Cart.updateOne(
          { userId },
          { $setOnInsert: { userId }, $push: { items: { listingId, qty } } },
          { upsert: true }
        );
      }
    }

    const cart = await getCartFor(userId);
    const subtotal = cart.items.reduce((sum, it) => sum + ((it?.listingId?.price || 0) * (it?.qty || 0)), 0);
    res.json({ items: cart.items, subtotal });
  } catch (e) { next(e); }
});

router.delete("/:listingId", userAuth, async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { listingId } = req.params;
    if (!mongoose.isValidObjectId(listingId)) return res.status(400).json({ message: "Invalid listingId" });
    await Cart.updateOne({ userId }, { $pull: { items: { listingId } } });
    const cart = await getCartFor(userId);
    const subtotal = cart.items.reduce((sum, it) => sum + ((it?.listingId?.price || 0) * (it?.qty || 0)), 0);
    res.json({ items: cart.items, subtotal });
  } catch (e) { next(e); }
});

router.delete("/", userAuth, async (req, res, next) => {
  try {
    const userId = req.user?._id;
    await Cart.updateOne({ userId }, { $set: { items: [] } }, { upsert: true });
    res.json({ items: [], subtotal: 0 });
  } catch (e) { next(e); }
});

export default router;

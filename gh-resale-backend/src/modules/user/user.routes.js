// modules/user/user.routes.js
import express from "express";
import { getUserData } from "./user.controller.js";
import userAuth from "../../middlewares/userAuth.js";
import User from "../../models/user.model.js";
import Listing from "../../models/listing.model.js";

const userRouter = express.Router();

// GET /users/data  -- > Yaha se current user ka data!
userRouter.get("/data", userAuth, getUserData);

// PATCH /users  -> updating new changes in the profile abhi vala 
userRouter.patch("/", userAuth, async (req, res, next) => {
  try {
    const uid = req.user?._id || req.user?.id;
    const { name, phone, location, address, avatar } = req.body || {};
    const $set = {};
    if (typeof name === "string") $set.name = name;
    if (typeof phone === "string") $set.phone = phone;
    if (typeof location === "string") $set.location = location;
    if (typeof address === "string") $set.address = address;
    if (typeof avatar === "string") $set.avatar = avatar;

    const doc = await User.findByIdAndUpdate(
      uid,
      { $set, $currentDate: { updatedAt: true } },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: doc });
  } catch (e) { next(e); }
});

// POST /users/upgrade-seller  -> you already had this; keep it
userRouter.post("/upgrade-seller", userAuth, async (req, res, next) => {
  try {
    const { shopName, bio, avatarUrl, address } = req.body || {};
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Keep your role logic; also set isSeller for frontend convenience
    user.role = user.role === "ADMIN" ? "ADMIN" : "SELLER";
    user.isSeller = true;
    user.sellerProfile = { ...(user.sellerProfile || {}), shopName, bio, avatarUrl, address };
    await user.save();

    res.json({
      success: true,
      message: "Upgraded to SELLER",
      role: user.role,
      isSeller: user.isSeller,
      sellerProfile: user.sellerProfile,
      user
    });
  } catch (e) { next(e); }
});

// PATCH /users/seller-profile  -> update seller fields
userRouter.patch("/seller-profile", userAuth, async (req, res, next) => {
  try {
    const uid = req.user?._id || req.user?.id;
    const { shopName, bio, avatarUrl, address } = req.body || {};

    const $set = { isSeller: true };
    if (typeof shopName === "string") $set["sellerProfile.shopName"] = shopName;
    if (typeof bio === "string") $set["sellerProfile.bio"] = bio;
    if (typeof avatarUrl === "string") $set["sellerProfile.avatarUrl"] = avatarUrl;
    if (typeof address === "string") $set["sellerProfile.address"] = address;

    const doc = await User.findByIdAndUpdate(
      uid,
      { $set, $currentDate: { updatedAt: true } },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: doc });
  } catch (e) { next(e); }
});

// GET /users/my-listings  -> listings created by the current user
userRouter.get("/my-listings", userAuth, async (req, res, next) => {
  try {
    const uid = req.user?._id || req.user?.id;
    const { page = 1, limit = 12, sort = "-createdAt" } = req.query;
    const pageN = Math.max(1, parseInt(page, 10) || 1);
    const limitN = Math.min(60, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageN - 1) * limitN;

    const [items, total] = await Promise.all([
      Listing.find({ sellerId: uid })
        .populate("sellerId", "name avatar sellerProfile rating")
        .sort(String(sort))
        .skip(skip)
        .limit(limitN)
        .lean(),
      Listing.countDocuments({ sellerId: uid }),
    ]);

    res.json({ success: true, items, total, page: pageN, limit: limitN });
  } catch (e) { next(e); }
});

export default userRouter;

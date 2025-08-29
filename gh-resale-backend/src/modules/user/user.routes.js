import express from "express";
import { getUserData } from "./user.controller.js";         
import userAuth from "../../middlewares/userAuth.js";
import User from "../../models/user.model.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);


userRouter.post("/upgrade-seller", userAuth, async (req, res) => {
  const { shopName, bio, avatarUrl, address } = req.body || {};
  const user = await User.findById(req.user._id);
  if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

  user.role = user.role === "ADMIN" ? "ADMIN" : "SELLER";
  user.sellerProfile = { ...(user.sellerProfile || {}), shopName, bio, avatarUrl, address };
  await user.save();

  res.json({ success: true, message: "Upgraded to SELLER", role: user.role, sellerProfile: user.sellerProfile });
});


export default userRouter;

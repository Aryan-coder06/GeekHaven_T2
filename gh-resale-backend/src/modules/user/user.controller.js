import userModel from "../../models/user.model.js";

export const getUserData = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .select("name email role phone location sellerProfile isAccountVerified createdAt")
      .lean();

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    return res.json({
      success: true,
      user, 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

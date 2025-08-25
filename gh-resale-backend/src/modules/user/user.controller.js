import userModel from "../../models/user.model.js";

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.json({ success: false, message: "User Not found" });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import userModel from "../../models/user.model.js";
// import transporter from "../../config/mailer.js";

// export const register = async (req, res) => {
//   const { name, email, password } = req.body;

//   if (!name || !email || !password) {
//     return res.json({ success: false, message: "Missing Details" });
//   }

//   try {
//     const existingUser = await userModel.findOne({ email });
//     if (existingUser) {
//       return res.json({ success: false, message: "User Already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10); // ***** for Privacy
//     const user = new userModel({ name, email, password: hashedPassword });
//     await user.save();

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     const mailOptions = {
//       from: process.env.SENDER_EMAIL,
//       to: email,
//       subject: "Welcome to Study Sync🔰",
//       text: `Welcome to Study Sync👍.Your account has been created with email id :${email}`,
//     };

//     await transporter.sendMail(mailOptions);
//     return res.json({ success: true });
//   } catch (error) {
//     res.json({ success: true, message: error.message });
//   }
// };

// export const login = async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.json({
//       success: false,
//       message: "Email and Password are required",
//     });
//   }

//   try {
//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return res.json({ success: false, message: "Invalid email" });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.json({ success: false, message: "Invalid password" });
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     return res.json({ success: true });
//   } catch (error) { }
// };

// export const logout = async (req, res) => {
//   try {
//     res.clearCookie("token", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
//     });

//     return res.json({ success: true, message: "Logged Out" });
//   } catch (error) {
//     return res.json({ success: false, message: error.message });
//   }
// };
// //////

// export const sendVerifyOtp = async (req, res) => {
//   console.log("req.body:", req.body); // likely empty

//   try {
//     const userId = req.user._id;

//     const user = await userModel.findById(userId);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });
//     if (user.isAccountVerified) return res.json({ success: false, message: "Already verified" });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     user.verifyOtp = otp;
//     user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
//     await user.save();

//     await transporter.sendMail({
//       from: process.env.SENDER_EMAIL,
//       to: user.email,
//       subject: "Account Verification OTP",
//       text: `Your OTP is ${otp}`,
//     });

//     res.json({ success: true, message: "OTP sent to your email" });
//   } catch (error) {
//     console.error("❌ Error in sendVerifyOtp:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };


// //////
// /*
//   User Id will be obtained by token and token is stored in cookies
//   so middle ware is required to get token from cookie.. 
//   UserId will be added to req.body
// */

// //Send Verificaiton OTP to the User's Email
// export const verifyEmail = async (req, res) => {
//   const { otp } = req.body;
//   const userId = req.user._id;

//   if (!otp) {
//     return res.json({ success: false, message: "Missing Details❓" });
//   }
//   try {
//     const user = await userModel.findById(userId);

//     if (!user) {
//       return res.json({ success: false, message: "User Not found❓" });
//     }
//     if (user.verifyOtp === "" || user.verifyOtp !== otp) {
//       return res.json({ success: false, message: "Invalid OTP❗" });
//     }
//     if (user.verifyOtpExpireAt < Date.now()) {
//       return res.json({ success: false, message: "OTP Expired❗" });
//     }

//     user.isAccountVerified = true;
//     user.verifyOtp = "";
//     user.verifyOtpExpireAt = 0;

//     await user.save();
//     return res.json({
//       success: true,
//       message: "Email verified successfully✅",
//     });
//   } catch (error) {
//     return res.json({ success: false, message: error.message });
//   }
// };

// // Check if user is Authenticated:
// export const isAuthenticated = async (req, res) => {
//   try {
//     return res.json({ success: true });
//   } catch (error) {
//     return res.json({ success: false, message: error.message });
//   }
// };

// //Send password Rest OTP
// export const sendResetOTP = async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.json({ success: false, message: "Email is required" });
//   }

//   try {
//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return res.json({ success: false, message: "User Not found" });
//     }

//     const otp = String(Math.floor(100000 + Math.random() * 900000));

//     user.resetOtp = otp;
//     user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

//     await user.save();

//     const mailOption = {
//       from: process.env.SENDER_EMAIL,
//       to: user.email,
//       subject: "Account Verification OTP",
//       text: `Your OTP for resetting your password is ${otp}.`,
//     };

//     await transporter.sendMail(mailOption);
//     return res.json({ success: true, message: "OTP sent successfully" });
//   } catch (error) {
//     return res.json({ success: false, message: error.message });
//   }
// };

// ///Rest User Passowrd
// export const resetPassword = async (req, res) => {
//   const { email, otp, newpassword } = req.body;

//   if (!email || !otp || !newpassword) {
//     return res.json({
//       success: false,
//       message: "Email, OTP and newPassowrd are required",
//     });
//   }

//   try {
//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return res.json({ success: false, message: "User Not found" });
//     }

//     if (user.resetOtp === "" || user.resetOtp !== otp) {
//       return res.json({ success: false, message: "Invalid OTP" });
//     }

//     if (user.resetOtpExpireAt < Date.now()) {
//       return res.json({ success: false, message: "OTP required" });
//     }

//     const hashedPassword = await bcrypt.hash(newpassword, 10);

//     user.password = hashedPassword;
//     user.resetOtp = "";
//     user.resetOtpExpireAt = 0;
//     await user.save();

//     return res.json({
//       success: false,
//       message: "Password has been reset successfully",
//     });
//   } catch (error) {
//     return res.json({ success: false, message: error.message });
//   }
// };

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../../models/user.model.js";
import transporter from "../../config/mailer.js";

/** Helper: set cookie consistently */
function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  });
}

export const register = async (req, res) => {
  const { name, email, password, asSeller } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      role: asSeller ? "SELLER" : "USER", // optional: allow signup as seller
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    setAuthCookie(res, token);

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Resale",
      text: `Welcome! Your account has been created with email: ${email}`,
    });

    return res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isAccountVerified: user.isAccountVerified },
      message: "Registered",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    setAuthCookie(res, token);

    return res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isAccountVerified: user.isAccountVerified },
      message: "Logged in",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (_req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.isAccountVerified) return res.status(400).json({ success: false, message: "Already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}`,
    });

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  if (!otp) return res.status(400).json({ success: false, message: "Missing OTP" });

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.verifyOtp || user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** For frontend to check session & get role quickly */
export const isAuthenticated = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .select("name email role phone location sellerProfile isAccountVerified createdAt")
      .lean();
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendResetOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for resetting your password is ${otp}.`,
    });

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newpassword } = req.body;
  if (!email || !otp || !newpassword) {
    return res.status(400).json({ success: false, message: "Email, OTP and new password are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.password = await bcrypt.hash(newpassword, 10);
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

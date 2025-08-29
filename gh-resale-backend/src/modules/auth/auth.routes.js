import express from "express";
import {
  isAuthenticated, login, logout, register, resetPassword,
  sendResetOTP, sendVerifyOtp, verifyEmail,
} from "./auth.controller.js";
import userAuth from "../../middlewares/userAuth.js";

const authRouter = express.Router();
  
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-email", userAuth, verifyEmail);
authRouter.get("/is-auth", userAuth, isAuthenticated);
authRouter.post("/send-reset-otp", sendResetOTP);
authRouter.post("/reset-password", resetPassword);

export default authRouter;

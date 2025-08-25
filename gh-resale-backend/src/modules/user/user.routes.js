import express from "express";
import { getUserData } from "../user/user.controller.js";
import userAuth from "../../middlewares/userAuth.js";


const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);

export default userRouter;
import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import { checkAuth, login, signup, updateprofile, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getSocialData } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/signup",signup);
userRouter.post("/login",login)
userRouter.put("/update-profile",protectRoute,updateprofile)
userRouter.get("/check",protectRoute,checkAuth);
userRouter.get("/social", protectRoute, getSocialData);
userRouter.post("/friend-request", protectRoute, sendFriendRequest);
userRouter.post("/friend-request/accept", protectRoute, acceptFriendRequest);
userRouter.post("/friend-request/reject", protectRoute, rejectFriendRequest);

export default userRouter 
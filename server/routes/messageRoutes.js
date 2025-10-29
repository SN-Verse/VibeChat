import express from 'express';
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage, deleteMessage, editMessage } from '../controllers/messageController.js';
import { protectRoute } from '../middleware/auth.js';

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.get("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.put("/:messageId", protectRoute, editMessage);
messageRouter.delete("/:messageId", protectRoute, deleteMessage); // Verify this route exists

export default messageRouter; 
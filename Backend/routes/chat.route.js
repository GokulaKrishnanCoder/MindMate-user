import express from "express";
import { getUsers, getMessages, sendMessage,updateProfile } from "../controllers/chat.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ✅ All routes are protected
router.get("/", auth, getUsers);
router.get("/messages/:receiverId", auth, getMessages);
router.post("/send", auth, sendMessage);
router.post("/updateProfile", auth, updateProfile);

export default router;

import User from "../models/User.model.js";
import Chats from "../models/Chat.model.js";

// ✅ Get all users except current one
export const getUsers = async (req, res) => {
  try {
    // Always use _id, not id
    const excludeId = req.user._id;
    const users = await User.find({ _id: { $ne: excludeId } }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get messages between current user and another user
export const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const messages = await Chats.find({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id },
      ],
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const message = await Chats.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import { Request, Response } from "express";
import Message from "../models/messageModel";
import Chat from "../models/chatModel";

export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  if (!chatId) {
    return res.status(400).json({ message: "Chat id is required" });
  }
  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "-password")
      .populate("chat");
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  const { chatId, message } = req.body;
  if (!chatId || !message) {
    return res
      .status(400)
      .json({ message: "Chat id and message are required" });
  }
  try {
    const newMessage = await Message.create({
      chat: chatId,
      sender: req.user._id,
      content: message,
    });
    const fullMessage = await Message.findById(newMessage._id)
      .populate("sender", "-password")
      .populate("chat")
      .populate({
        path: "chat",
        populate: { path: "users", select: "-password" },
      });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

    return res.status(200).json(fullMessage);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

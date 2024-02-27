import { Request, Response } from "express";
import Chat from "../models/chatModel";

export const accessChat = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: "User id is required" });
  }
  let chat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: userId } } },
      { users: { $elemMatch: { $eq: req.user._id } } },
    ],
  })
    .populate("users", "-password")
    .populate({
      path: "latestMessage",
      populate: {
        path: "sender",
        select: "-password",
      },
    });

  if (chat.length > 0) {
    return res.status(200).json(chat[0]);
  }
  try {
    const newChat = await Chat.create({
      chatName: "new chat",
      isGroupChat: false,
      users: [userId, req.user._id],
    });

    const fullChat = await Chat.findById(newChat._id)
      .populate("users", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
        },
      });

    return res.status(200).json(fullChat);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

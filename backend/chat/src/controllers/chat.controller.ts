import axios from "axios";
import TryCatch from "../config/TryCatch.js";
import { AuthReq } from "../middlewares/isAuth.js";
import chatModel from "../models/chat.model.js";
import msgModel from "../models/msg.model.js";

export const createNewChat = TryCatch(async (req: AuthReq, res) => {
  const userId = req.user?._id;
  const { otherUserId } = req.body;

  if (!otherUserId) {
    return res.status(400).json({ message: "Other UserId is required" });
  }

  const existingChat = await chatModel.findOne({
    users: { $all: [userId, otherUserId], $size: 2 },
  });

  if (existingChat) {
    return res.status(200).json({
      message: "Chat already exists",
      existingChat,
    });
  }

  const newChat = await chatModel.create({
    users: [userId, otherUserId],
  });

  res.status(200).json({ message: "New chat created", chatId: newChat._id });
});

export const getAllChats = TryCatch(async (req: AuthReq, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "userid is missing" });
  }

  const chats = await chatModel.find({ users: userId }).sort({ updatedAt: -1 });

  const chatWithUserData = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.users.find(
        (id) => id.toString() !== userId.toString(),
      );

      const unseenMsgCount = await msgModel.countDocuments({
        chatId: chat._id,
        seen: false,
        sender: { $ne: userId },
      });

      try {
        const { data } = await axios.get(
          `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`,
        );
        return {
          user: data,
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenMsgCount,
          },
        };
      } catch (error) {
        console.log("Error fetching user data for chat:", error);
        return {
          user: { id_: otherUserId, name: "Unknown User" },
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenMsgCount,
          },
        };
      }
    }),
  );
  res.json({ chats: chatWithUserData });
});

export const sendNewMsg = TryCatch(async (req: AuthReq, res) => {
  const senderId = req.user?._id;
  const { chatId, text } = req.body;
  const imagefile = req.file;

  if (!senderId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!chatId) {
    return res.status(400).json({ message: "chatId required" });
  }

  if (!text && !imagefile) {
    return res.status(400).json({ message: "text or image required" });
  }

  const chat = await chatModel.findById(chatId);

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const isUserInChat = chat.users.some(
    (id) => id.toString() === senderId.toString(),
  );

  if (!isUserInChat) {
    return res
      .status(403)
      .json({ message: "You are not a member of this chat" });
  }

  const otherUserId = chat.users.find(
    (id) => id.toString() !== senderId.toString(),
  );

  if (!otherUserId) {
    return res.status(400).json({ message: "no other user" });
  }

  //socket setup

  let msgData: any = {
    chatId,
    sender: senderId,
    seen: false,
    seenAt: undefined,
  };

  if (imagefile) {
    msgData.image = {
      url: imagefile.path,
      publicId: imagefile.filename,
    };
    msgData.msgType = "image";
    msgData.text = text || "";
  } else {
    msgData.text = text;
    msgData.msgType = "text";
  }

  const msg = new msgModel(msgData);
  const savedMsg = await msg.save();

  chat.latestMessage = {
    text: imagefile ? "Sent an image 📷" : text,
    sender: senderId.toString(),
    timestamp: new Date(),
  };
  await chatModel.findByIdAndUpdate(
    chatId,
    {
      latestMessage: chat.latestMessage,
      sender: senderId,
      updatedAt: new Date(),
    },
    { returnDocument: "after" },
  );

  //emit to sockets
  res
    .status(200)
    .json({ message: "Message sent", msg: savedMsg, sender: senderId });
});

export const getMsgbyChat = TryCatch(async (req: AuthReq, res) => {
  const userId = req.user?._id;
  const { chatId } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!chatId) {
    return res.status(400).json({ message: "chatId required" });
  }

  const chat = await chatModel.findById(chatId);

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const isUserInChat = chat.users.some(
    (id) => id.toString() === userId.toString(),
  );

  if (!isUserInChat) {
    return res
      .status(403)
      .json({ message: "You are not a member of this chat" });
  }

  const msgsToMarkSeen = await msgModel.find({
    chatId,
    sender: { $ne: userId },
    seen: false,
  });

  await msgModel.updateMany(
    { chatId, sender: { $ne: userId }, seen: false },
    { seen: true, seenAt: new Date() },
  );

  const msgs = await msgModel.find({ chatId }).sort({ createdAt: 1 });

  const otherUserId = chat.users.find(
    (id) => id.toString() !== userId.toString(),
  );

  try {
    const { data } = await axios.get(
      `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`,
    );
    if (!otherUserId) {
      return res.status(400).json({ message: "no other user" });
    }
    //socket setup

    res.status(200).json({ messages: msgs, user: data });
  } catch (error) {
    console.log("Error fetching user data for chat:", error);
    res.status(200).json({
      messages: msgs,
      user: { id_: otherUserId, name: "Unknown User" },
    });
  }
});

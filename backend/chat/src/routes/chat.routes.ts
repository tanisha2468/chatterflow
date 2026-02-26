import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  createNewChat,
  getAllChats,
  sendNewMsg,
  getMsgbyChat,
} from "../controllers/chat.controller.js";
import upload from "../middlewares/multer.js";
import { get } from "mongoose";

const router = express.Router();

router.post("/chat/new", isAuth, createNewChat);
router.get("/chat/all", isAuth, getAllChats);
router.post("/message", isAuth, upload.single("image"), sendNewMsg);
router.get("/message/:chatId", isAuth, getMsgbyChat);

export default router;

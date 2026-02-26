import express from "express";
import {
  loginuser,
  verifyUser,
  myProfile,
  getAllUsers,
  getUser,
  updateName,
} from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/login", loginuser);
router.post("/verify", verifyUser);
router.get("/profile", isAuth, myProfile);
router.get("/user/all", isAuth, getAllUsers);
router.get("/user/:id", getUser);
router.post("/update-name", isAuth, updateName);

export default router;

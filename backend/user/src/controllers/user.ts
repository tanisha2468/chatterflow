import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { AuthRequest } from "../middlewares/isAuth.js";
import { User } from "../model/user.js";

export const loginuser = TryCatch(async (req, res) => {
  console.log("LOGIN HIT");
  const { email } = req.body;
  const rateLimitKey = `otp:rate_limit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);

  if (rateLimit) {
    return res
      .status(429)
      .json({ message: "Too many requests. Please try again later." });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpkey = `otp:${email}`;

  await redisClient.set(otpkey, otp, { EX: 300 });
  await redisClient.set(rateLimitKey, "1", { EX: 60 });

  const message = {
    to: email,
    subject: "Your OTP Code",
    body: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
  };

  await publishToQueue("send-otp", message);

  res.status(200).json({ message: "OTP sent to email" });
});

export const verifyUser = TryCatch(async (req, res) => {
  const { email, otp: enteredotp } = req.body;

  if (!email || !enteredotp) {
    return res.status(400).json({
      message: "Email and OTP are required",
    });
  }

  const otpkey = `otp:${email}`;
  const storedotp = await redisClient.get(otpkey);
  if (!storedotp || storedotp !== enteredotp) {
    return res.status(400).json({
      message: "OTP expired or invalid",
    });
  }

  await redisClient.del(otpkey);
  let user = await User.findOne({ email });

  if (!user) {
    const name = email.slice(0, email.indexOf("@"));
    user = await User.create({ name, email });
  }

  const token = generateToken(user);
  res.json({
    message: "user verified",
    user,
    token,
  });
});

export const myProfile = TryCatch(async (req, res) => {
  const user = (req as AuthRequest).user;

  res.json(user);
});

export const updateName = TryCatch(async (req, res) => {
  const user = await User.findById((req as AuthRequest).user?._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = (req as AuthRequest).body.name;
  await user.save();

  const token = generateToken(user);

  res.json({ message: "Name updated", user, token });
});

export const getAllUsers = TryCatch(async (req, res) => {
  const users = await User.find();

  res.json({ users });
});

export const getUser = TryCatch(async (req, res) => {
  const userId = (req as AuthRequest).params.id;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user });
});

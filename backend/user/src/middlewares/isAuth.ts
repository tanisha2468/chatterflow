import { NextFunction, Request, Response } from "express";
import type { IUser } from "../model/user.js";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user: IUser | null;
}

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Pls login - no auth header" });
    }

    const token = authHeader.split(" ")[1];
    const decodedvalue = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (!decodedvalue || !decodedvalue.user) {
      res.status(401).json({ message: "invalid token" });
      return;
    }

    (req as AuthRequest).user = decodedvalue.user;
    next();
  } catch (error) {
    res.status(401).json({ message: "pls login - jwt error " });
  }
};

export default isAuth;

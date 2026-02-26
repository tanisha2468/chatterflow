import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
}

export interface AuthReq extends Request {
  user?: IUser;
}

export const isAuth = async (
  req: AuthReq,
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

    req.user = decodedvalue.user;
    next();
  } catch (error) {
    res.status(401).json({ message: "pls login - jwt error " });
  }
};

export default isAuth;

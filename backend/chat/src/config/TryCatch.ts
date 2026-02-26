import { NextFunction, Request, Response } from "express";

type AsyncHandler<T = Request> = (
  req: T,
  res: Response,
  next: NextFunction
) => Promise<any>;

const TryCatch = <T = Request>(handler: AsyncHandler<T>) => {
  return async (req: T, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
};

export default TryCatch;

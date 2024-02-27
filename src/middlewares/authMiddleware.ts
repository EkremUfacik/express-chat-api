import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["token"];
    if (!token) {
      return res.status(401).json({ message: "You are not authorized" });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload;

    if (!decoded) {
      return res.status(401).json({ message: "You are not authorized" });
    }
    req.user = await User.findById(decoded.id).select("-password");

    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

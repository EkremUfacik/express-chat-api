import mongoose from "mongoose";

declare module "express-serve-static-core" {
  interface Request {
    user: {
      _id: mongoose.Types.ObjectId;
      email: string;
      username: string;
      pic: string;
      isAdmin: boolean;
    };
  }
}

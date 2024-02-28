import { generateToken } from "../config/generateToken";
import { hashPassword, matchPassword } from "../config/hashPassword";
import { Request, Response } from "express";
import User from "../models/userModel";

export const getAllUsers = async (req: Request, res: Response) => {
  console.log("users fetched");
  const keyword = req.query.search
    ? {
        $or: [
          { username: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  try {
    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select("-password");

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await matchPassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id.toString());

    res.cookie("token", token, {
      httpOnly: true,
    });

    const { _id, username, pic, isAdmin } = user;

    return res.status(200).json({
      _id,
      username,
      email: user.email,
      pic,
      isAdmin,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username, pic } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email,
      password: hashedPassword,
      username,
      pic,
    });

    const token = generateToken(user._id.toString());

    res.cookie("token", token, {
      httpOnly: true,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out" });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

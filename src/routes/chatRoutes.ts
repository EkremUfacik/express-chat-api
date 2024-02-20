import express from "express";
import { accessChat } from "../controllers/chatController";
import { isAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/:userId").get(isAuth, accessChat);

export default router;

import express from "express";
import { sendMessage } from "../controllers/messageController";
import { isAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/").post(isAuth, sendMessage);

export default router;

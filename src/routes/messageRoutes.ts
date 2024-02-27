import express from "express";
import { getMessages, sendMessage } from "../controllers/messageController";
import { isAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/").post(isAuth, sendMessage);
router.route("/:chatId").get(isAuth, getMessages);

export default router;

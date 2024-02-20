import express from "express";
import { getAllUsers, login, register } from "../controllers/userControllers";
import { isAuth } from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/").get(isAuth, getAllUsers);
router.route("/register").post(register);
router.route("/login").post(login);

export default router;

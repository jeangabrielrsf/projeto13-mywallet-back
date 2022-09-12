import express from "express";
import { login, signOut, signUp } from "../controllers/authController.js";

const authRouter = express.Router();
authRouter.post("/sign-up", signUp);
authRouter.post("/login", login);
authRouter.delete("/sign-out", signOut);

export default authRouter;

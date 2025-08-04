import { Hono } from "hono";
import { authController } from "../controllers/authControllers";

export const auth = new Hono();

auth.post("/register", authController.register);
auth.post("/login", authController.login);

//Handles all "/users/" routes
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { usersController } from "../controllers/usersController";
import { jwtExpiration } from "../utils/middlewares/jwtExpiration";

export const users = new Hono();

users.use("/*", jwt({
  secret: process.env.JWT_SECRET!,
}));
users.use("/*", jwtExpiration);

users.get("/", usersController.index);


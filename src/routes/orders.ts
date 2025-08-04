import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { jwtExpiration } from "../utils/middlewares/jwtExpiration";
import { ordersController } from "../controllers/ordersController";
import { isAdminUser } from "../utils/middlewares/isAdminUser";

export const orders = new Hono();

orders.use("/*", jwt({
  secret: process.env.JWT_SECRET!,
}));
orders.use("/*", jwtExpiration);

orders.get("/", ordersController.getAll);
orders.post("/", ordersController.createOrder);
orders.put("/:orderId", isAdminUser, ordersController.updateOrder);

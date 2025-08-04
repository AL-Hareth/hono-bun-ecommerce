import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { cartsController } from "../controllers/cartsController";
import { changeOwnItem } from "../utils/middlewares/changeOwnItems";
import { jwtExpiration } from "../utils/middlewares/jwtExpiration";
import { db } from "../db";
import { cartItemTable, cartsTable } from "../db/schema";
import { eq } from "drizzle-orm";

export const carts = new Hono();

carts.use("/*", jwt({
  secret: process.env.JWT_SECRET!,
}));
carts.use("/*", jwtExpiration);

carts.get("/", async (c) => {
  const allCarts = await db
    .select()
    .from(cartsTable)
    .leftJoin(cartItemTable, eq(cartItemTable.cartId, cartsTable.id));
  return c.json(allCarts);
}); // DEBUG ONLY

carts.post("/", cartsController.createCart);
carts.post("/item", cartsController.addItem);
carts.delete("/item/:itemId", changeOwnItem, cartsController.deleteItem);
carts.put("/item/:itemId", changeOwnItem, cartsController.changeItemQuantity);

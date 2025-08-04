import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { extractUserId } from "../lib";
import { db } from "../../db";
import { cartItemTable, cartsTable } from "../../db/schema";
import { eq } from "drizzle-orm";

/** This middleware is used when the user wants to modify the cart item details or delete it
 * we should check that the user is trying to affect a cart item that belongs to his cart only
 **/
export const changeOwnItem = createMiddleware(async (c: Context, next: Next) => {
    const userId = extractUserId(c.req.header("Authorization")!)
    const cartItemId = c.req.param("itemId");

    const [cartItem] = await db.select().from(cartItemTable).where(eq(cartItemTable.id, cartItemId));
    const [cart] = await db.select().from(cartsTable).where(eq(cartsTable.id, cartItem.cartId as string));

    if (userId !== cart.userId) {
        return c.json({ error: "Sorry, you can't change this cart item because it does not belong to your cart" }, 403);
    }

    await next();
});

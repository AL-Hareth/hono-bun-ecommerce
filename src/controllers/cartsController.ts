import { Context } from "hono";
import { Controller } from "./ControllerTypes";
import { cartItemTable, cartsTable } from "../db/schema";
import { db } from "../db";
import { extractUserId } from "../utils/lib";
import { and, eq } from "drizzle-orm";

interface CartsController extends Controller {
  createCart: (c: Context) => Promise<Response>;
  addItem: (c: Context) => Promise<Response>;
  deleteItem: (c: Context) => Promise<Response>;
  changeItemQuantity: (c: Context) => Promise<Response>;
}

export async function clearCart(cartId: string) {
  try {
    await db.delete(cartItemTable).where(eq(cartItemTable.cartId, cartId));
  } catch (error) {
    throw new Error("Unable to clear the cart");
  }
}

export const cartsController: CartsController = {
  createCart: async (c) => {
    const userId = extractUserId(c.req.header("Authorization")!);

    try {
      const existingCart = await db.select().from(cartsTable).where(eq(cartsTable.userId, userId as string)).limit(1);

      if (existingCart.length !== 0) { // User already has a cart
        return c.json({ error: "You already have a cart" }, 400);
      }

      await db.insert(cartsTable).values({
        userId: userId as string
      });

      return c.json({ message: "Cart created successfully" });
    } catch (error) {
      return c.json({ error: "Unable to create a cart" }, 500);
    }
  },

  addItem: async (c) => {
    const userId = extractUserId(c.req.header("Authorization")!);
    const { productId, quantity } = await c.req.json();

    if (!productId || !quantity) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (quantity <= 0) {
      return c.json({ error: "Quantity must be greater than 0" }, 400);
    }

    try {
      // Get the cart id
      const [cart] = await db.select().from(cartsTable).where(eq(cartsTable.userId, userId as string)).limit(1);
      let cartId;

      if (!cart) {
        const [newCart] = await db.insert(cartsTable).values({
          userId: userId as string
        }).returning();

        cartId = newCart.id;
      } else {
        cartId = cart.id;
      }

      // check if this item already exists for this user
      const [existingItem] = await db.select().from(cartItemTable).where(and(eq(cartItemTable.cartId, cartId), eq(cartItemTable.productId, productId))).limit(1);

      if (existingItem) {
        return c.json({ error: "This item already exists in your cart" }, 400); // or we can change quantity
      }

      await db.insert(cartItemTable).values({
        quantity,
        cartId,
        productId
      });

      return c.json({ message: "Item added to cart successfully" });
    } catch (error) {
      return c.json({ error: "Unable to add item to cart" }, 500);
    }
  },

  deleteItem: async (c) => {
    const cartItemId = c.req.param("itemId");

    try {
      const result = await db.delete(cartItemTable).where(eq(cartItemTable.id, cartItemId));

      if (result.rowCount === 0) {
        return c.json({ error: "Item not found" }, 404);
      }

      return c.json({ message: "Item deleted from cart successfully" });
    } catch (error) {
      return c.json({ error: "Unable to delete item from cart" }, 500);
    }
  },

  changeItemQuantity: async (c) => {
    const cartItemId = c.req.param("itemId");
    const { quantity } = await c.req.json();

    if (!quantity) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (quantity <= 0) {
      return c.json({ error: "Quantity must be greater than 0" }, 400);
    }

    try {
      const result = await db
        .update(cartItemTable)
        .set({ quantity })
        .where(eq(cartItemTable.id, cartItemId))
        .returning();

      if (result.length === 0) {
        return c.json({ error: "item not found" }, 404);
      }

      return c.json({ message: "Quantity changed" });
    } catch (error) {
      return c.json({ error: "Could not change the item quantity" });
    }
  }
};

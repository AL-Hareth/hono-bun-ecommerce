import { Context } from "hono";
import { Controller } from "./ControllerTypes";
import { extractUserId } from "../utils/lib";
import { cartItemTable, cartsTable, orderItemTable, ordersTable, productsTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { clearCart } from "./cartsController";

interface OrdersController extends Controller {
  getAll: (c: Context) => Promise<Response>;
  createOrder: (c: Context) => Promise<Response>;
  updateOrder: (c: Context) => Promise<Response>;
}

export const ordersController: OrdersController = {
  getAll: async (c) => {
    const orders = await db.select().from(ordersTable);
    return c.json(orders);
  },

  createOrder: async (c) => {
    const userId = extractUserId(c.req.header("Authorization")!);
    const result = await db
      .select({
        cart: cartsTable,
        cartItems: cartItemTable,
      })
      .from(cartsTable)
      .where(eq(cartsTable.userId, userId as string))
      .leftJoin(cartItemTable, eq(cartItemTable.cartId, cartsTable.id));

    if (result.length === 0) {
      return c.json({ error: "Cart is empty" }, 400);
    }

    const cartData = {
      cart: result[0].cart,
      cartItems: result.map((row) => row.cartItems)
    };

    // First: Create the order and get its id to link it with the order items
    const [order] = await db.insert(ordersTable).values({
      userId: userId as string,
    }).returning();
    const orderId = order.id;

    // Add each product to the cart with its quantity and current price
    cartData.cartItems.forEach(async (item) => {
      const [productData] = await db.select().from(productsTable).where(eq(productsTable.id, item?.productId as string));
      await db.insert(orderItemTable).values({
        orderId,
        productId: item?.productId as string,
        quantity: item?.quantity,
        selling_price: productData.price
      });

    });

    // Clear the users cart
    clearCart(cartData.cart.id);

    return c.json({
      message: "Order craeted successfully"
    }, 201);
  },

  updateOrder: async (c) => {
    const orderId = c.req.param("orderId");
    const { status } = await c.req.json();

    if (!status || !["pending", "paid", "shipped", "cancelled"].includes(status)) {
      return c.json({ "error": "Status not specified correctly" });
    }

    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
    if (!order) {
      return c.json({ error: "There is no order with the given ID" });
    }

    await db.update(ordersTable).set({
      status
    }).where(eq(ordersTable.id, orderId));

    return c.json({ message: "order status updated successfully" });
  }
};

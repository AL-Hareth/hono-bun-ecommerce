import { relations } from "drizzle-orm";
import { cartItemTable, cartsTable, categoriesTable, orderItemTable, ordersTable, productsTable, usersTable } from "./schema";

// Users relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  orders: many(ordersTable),
  carts: many(cartsTable)
}));

// Categories relations
export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  products: many(productsTable)
}));

// Products relations
export const productsRelations = relations(productsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [productsTable.categoryId],
    references: [categoriesTable.id]
  }),
  orderItems: many(orderItemTable),
  cartItems: many(cartItemTable),
}));

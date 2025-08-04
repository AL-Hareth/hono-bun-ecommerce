import { boolean, pgTable, varchar, decimal, integer, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  password: varchar("password").notNull(),
  address: varchar("address"),
  isAdmin: boolean("is_admin").notNull().$defaultFn(() => false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const productsTable = pgTable("products", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name").notNull(),
  description: varchar("description"),
  price: decimal("price").notNull(),
  quantity: integer("quantity").notNull().$defaultFn(() => 0),
  categoryId: varchar("category_id").references(() => categoriesTable.id),
  images_url: varchar("images_url"), // a string of comma-separated image URLs
  createdAt: varchar("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const categoriesTable = pgTable("categories", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  createdAt: varchar("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const ordersTable = pgTable("orders", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").references(() => usersTable.id),
  status: varchar("status").notNull().$defaultFn(() => "pending"), // The status of the order: "pending", "paid", "shipped", "cancelled"
  createdAt: varchar("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const orderItemTable = pgTable("order_item", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: varchar("order_id").references(() => ordersTable.id),
  productId: varchar("product_id").references(() => productsTable.id),
  selling_price: decimal("selling_price").notNull(), // This is the price at the time of ordering
  quantity: integer("quantity").notNull().$defaultFn(() => 1),
  createdAt: varchar("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const paymentsTable = pgTable("payments", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: varchar("order_id").references(() => ordersTable.id),
  amount: decimal("amount").notNull(),
  paymentMethod: varchar("payment_method").notNull(),
  transactionId: varchar("transaction_id").notNull(),
  status: varchar("status").notNull().$defaultFn(() => "pending"), // status value can be: "pending", "succeeded", "failed"
  createdAt: varchar("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const cartsTable = pgTable("carts", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").references(() => usersTable.id),
  createdAt: varchar("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const cartItemTable = pgTable("cart_item", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  cartId: varchar("cart_id").references(() => cartsTable.id),
  productId: varchar("product_id").references(() => productsTable.id),
  quantity: integer("quantity").notNull().$defaultFn(() => 1),
  createdAt: varchar("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const imagesTable = pgTable("images", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  imageUrl: varchar("image_url").notNull(),
  productId: varchar("product_id").references(() => productsTable.id),
  createdAt: varchar("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type NewUser = typeof usersTable.$inferInsert;
export type NewProduct = typeof productsTable.$inferInsert;
export type NewCategory = typeof categoriesTable.$inferInsert;
export type NewOrder = typeof ordersTable.$inferInsert;
export type NewOrderItem = typeof orderItemTable.$inferInsert;
export type NewPayment = typeof paymentsTable.$inferInsert;
export type NewCart = typeof cartsTable.$inferInsert;
export type NewCartItem = typeof cartItemTable.$inferInsert;
export type NewImage = typeof imagesTable.$inferInsert;


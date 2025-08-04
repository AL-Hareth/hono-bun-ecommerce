import { Hono } from "hono"
import { users } from "./routes/users";
import { auth } from "./routes/auth";
import { categories } from "./routes/categories";
import { products } from "./routes/products";
import { orders } from "./routes/orders";
import { carts } from "./routes/carts";

const app = new Hono()

// Routes setup
app.route("/users", users);
app.route("/auth", auth);
app.route("/categories", categories);
app.route("/products", products);
app.route("/carts", carts);
app.route("/orders", orders);

app.get("/", (c) => {
  return c.text("/ route");
})

export default app

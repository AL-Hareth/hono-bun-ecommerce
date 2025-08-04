import { Context } from "hono";
import { sign } from "hono/jwt";
import { Controller } from "./ControllerTypes";
import { NewUser, usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db";

interface AuthController extends Controller {
  register: (c: Context) => Promise<Response>;
  login: (c: Context) => Promise<Response>;
}

async function generateToken(userId: string) {
  const payload = {
    sub: userId,
    exp: Date.now() + 1000 * 60 * 60 * 4, // 4 hours
  };

  const secret = process.env.JWT_SECRET!;
  return await sign(payload, secret);
}

export const authController: AuthController = {
  register: async (c) => {
    const { email, name, password } = await c.req.json();

    if (!email || !name || !password) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if ((await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1)).length !== 0) {
      return c.json({ error: "This email is already in use!" }, 400);
    }

    const hashedPassword = await Bun.password.hash(password, "bcrypt");

    const user: NewUser = {
      email,
      name,
      password: hashedPassword,
    };

    const result = await db.insert(usersTable).values(user).returning();

    const token = await generateToken(result[0].id);

    return c.json({ message: "User created", token });
  },

  login: async (c) => {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1)

    if (user.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    const isValid = await Bun.password.verify(password, user[0].password, "bcrypt");

    if (!isValid) {
      return c.json({ error: "Invalid password" }, 400);
    }

    const token = await generateToken(user[0].id);

    return c.json({ message: "User logged in", token });
  }
};

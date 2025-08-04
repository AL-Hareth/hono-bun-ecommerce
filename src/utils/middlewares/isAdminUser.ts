import { Context, Next } from "hono";
import { decode, verify } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import { db } from "../../db";
import { usersTable } from "../../db/schema";
import { eq } from "drizzle-orm";

export const isAdminUser = createMiddleware(async (c: Context, next: Next) => {
    // check for the authorization header
    const authorizationHeader = c.req.header("Authorization");
    if (!authorizationHeader) {
        return c.json({ error: "Please provide an authorization header" }, 401);
    }

    // check if the token provided is valid
    const token = authorizationHeader.split(" ")[1];
    try {
        await verify(token, process.env.JWT_SECRET!); // This line will throw an error if the token is invalid
    } catch (error) {
        return c.json({ error: "Your token is invalid" }, 401);
    }

    const { payload } = decode(token); // getting the user id from the token since it is valid

    // check if the user exists in the database (This should not run unless the secret key is leaked)
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.sub as string));
    if (!user) {
        return c.json({ error: "User not found, please request with a valid id" }, 404);
    }

    if (!user.isAdmin) { // The user is not an admin and the request should be rejected
        return c.json({ error: "This user is not authorized to accesss this route" }, 403);
    }

    // if we reach this line, the token must belong to an admin user which means we can continue to the request
    await next();
});

import { createMiddleware } from "hono/factory";
import { decode } from "hono/jwt";

export const jwtExpiration = createMiddleware(async (c, next) => {
    const { payload: { exp } } = decode(c.req.header("Authorization")!.split(" ")[1]);

    if (exp && Date.now() > exp) {
        return c.json({ error: "Token expired, please re\-login" }, 401);
    }

    await next();
});

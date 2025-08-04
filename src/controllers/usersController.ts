import { Context } from "hono";
import { Controller } from "./ControllerTypes";
import { db } from "../db";
import { usersTable } from "../db/schema";

interface UsersController extends Controller {
  index: (c: Context) => Promise<Response>;
}

export const usersController: UsersController = {
  index: async (c) => {
    const users = await db.select().from(usersTable);

    return c.json(users);
  }
};

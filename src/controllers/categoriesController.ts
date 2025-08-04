import { Context } from "hono";
import { Controller } from "./ControllerTypes";
import { categoriesTable } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

interface CategoriesController extends Controller {
  getAll: (c: Context) => Promise<Response>;
  getOne: (c: Context) => Promise<Response>;
  create: (c: Context) => Promise<Response>;
  update: (c: Context) => Promise<Response>;
  delete: (c: Context) => Promise<Response>;
}

export const categoriesController: CategoriesController = {
  getAll: async (c) => { // Get all categories
    try {
      const categories = await db.select().from(categoriesTable);

      return c.json(categories);
    } catch (error) {
      return c.json({ error: "Failed to get categories" }, 500);
    }
  },

  getOne: async (c) => { // get one by id
    const id = c.req.param("id");

    try {
      const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));

      if (!category) {
        return c.json({ error: "Category not found" }, 404);
      }

      return c.json(category);
    } catch (error) {
      return c.json({ error: `Failed to get category with id ${id}` }, 500);
    }
  },

  create: async (c) => {
    const { name, slug } = await c.req.json();

    try {
      await db.insert(categoriesTable).values({
        name,
        slug
      });

      return c.json({ message: `successfully created the ${name} category` }, 201);
    } catch (error) {
      return c.json({ error: "Failed to create a category" }, 500);
    }

  },

  update: async (c) => {
    const id = c.req.param("id");
    const { name, slug } = await c.req.json();

    try {
      const result = await db.update(categoriesTable).set({
        name,
        slug
      }).where(eq(categoriesTable.id, id));

      if (result.rowCount === 0) {
        return c.json({ error: "Category not found" }, 404);
      }

      return c.json({ message: `Successfully updated the ${name} category` }, 200);
    } catch (error) {
      return c.json({ error: `Failed to update the category with id ${id}` }, 500);
    }
  },

  delete: async (c) => {
    const id = c.req.param("id");

    try {
      const result = await db.delete(categoriesTable).where(eq(categoriesTable.id, id));

      if (result.rowCount === 0) {
        return c.json({ error: "Category not found" }, 404);
      }

      return c.json({ message: `Successfully deleted the ${id} category` }, 200)
    } catch (error) {
      return c.json({ error: `Failed to delete the category with id ${id}` }, 500);
    }
  },
};

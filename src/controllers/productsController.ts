import { Context } from "hono";
import { Controller } from "./ControllerTypes";
import { db } from "../db";
import { productsTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { bucket, uploadFile } from "../utils/bucket";

interface ProuctsController extends Controller {
  getAll: (c: Context) => Promise<Response>;
  getOne: (c: Context) => Promise<Response>;
  create: (c: Context) => Promise<Response>;
  update: (c: Context) => Promise<Response>;
  delete: (c: Context) => Promise<Response>;
  uploadImage: (c: Context) => Promise<Response>;
}

export const productsController: ProuctsController = {
  getAll: async (c) => { // Get all products
    try {
      const products = await db.select().from(productsTable);
      return c.json(products);
    } catch (error) {
      return c.json({ error: "Product creation failed" }, 500);
    }
  },

  getOne: async (c) => { // Get one product by id
    const id = c.req.param("id");

    try {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));

      if (!product) { // There is no product with that id
        return c.json({ error: "Product not found" }, 404);
      }

      return c.json(product);
    } catch (error) {
      return c.json({ error: "Product creation failed" }, 500);
    }
  },

  create: async (c) => {
    // This request will get the data from the form which includes normal data and files
    const form = await c.req.formData();

    const name = form.get("name");
    const description = form.get("description");
    const price = Number(form.get("price"));
    const quantity = Number(form.get("quantity"));
    const categoryId = form.get("categoryId");

    let images_url: string[] | string = [];

    //@ts-ignore
    for (const [key, value] of form.entries()) {
      if (key !== 'files' || !(value instanceof File)) continue;

      const publicUrl = await uploadFile(value);
      images_url.push(publicUrl);
    }

    images_url = images_url.join(",");

    if (!name || !description || !price || !quantity || !categoryId) {
      return c.json({ error: "Please make sure to include all the required data about the product" }, 400);
    }

    try {
      await db.insert(productsTable).values({
        //@ts-ignore
        name,
        description,
        price,
        quantity,
        categoryId,
        images_url
      });

      return c.json({ message: "Product was added successfully" }, 201);
    } catch (error) {
      return c.json({ error: "Product creation failed" }, 500);
    }
  },

  update: async (c) => {
    const id = c.req.param("id");
    const { name, description, price, quantity, categoryId, images_url } = await c.req.json();

    if (!name || !description || !price || !quantity || !categoryId || !images_url) {
      return c.json({ error: "Please make sure to include all the required data about the product" }, 400);
    }

    try {
      const result = await db.update(productsTable).set({
        name,
        description,
        price,
        quantity,
        categoryId,
        images_url
      }).where(eq(productsTable.id, id));

      if (result.rowCount === 0) {
        return c.json({ error: "Product not found" }, 404);
      }

      return c.json({ message: "Product was edited successfully" }, 200);
    } catch (error) {
      return c.json({ error: "Product modification failed" }, 500);
    }
  },

  delete: async (c) => {
    const id = c.req.param("id");

    try {
      const result = await db.delete(productsTable).where(eq(productsTable.id, id));

      if (result.rowCount === 0) {
        return c.json({ error: "Product not found" }, 404);
      }

      return c.json({ message: `The product with the id ${id} was successfully deleted` });
    } catch (error) {
      return c.json({ error: "product deletion failed" });
    }
  },

  uploadImage: async (c) => {
    const form = await c.req.formData();
    const file = form.get('file'); // name="file" in the form

    if (!(file instanceof File)) {
      return c.json({ error: "Please upload a file" }, 400);
    }

    uploadFile(file);
    return c.json({ message: "File uploaded successfully" }, 201);
  }

}

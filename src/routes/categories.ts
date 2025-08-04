import { Hono } from "hono";
import { categoriesController } from "../controllers/categoriesController";

export const categories = new Hono();

categories.get("/", categoriesController.getAll);
categories.get("/:id", categoriesController.getOne);
categories.post("/", categoriesController.create);
categories.put("/:id", categoriesController.update);
categories.delete("/:id", categoriesController.delete);
